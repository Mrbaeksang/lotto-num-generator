/**
 * 재시도 로직을 위한 설정 인터페이스
 */
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number; // 기본 지연 시간 (ms)
  maxDelay: number; // 최대 지연 시간 (ms)
  backoffMultiplier: number; // 백오프 배수
  retryableErrors: string[]; // 재시도 가능한 에러 패턴
}

/**
 * 기본 재시도 설정
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000, // 1초
  maxDelay: 10000, // 10초
  backoffMultiplier: 2,
  retryableErrors: [
    'timeout',
    'network',
    'ECONNRESET',
    'ENOTFOUND',
    'ETIMEDOUT',
    'navigation',
    'waiting for selector'
  ]
};

/**
 * 스크래핑 전용 재시도 설정
 */
export const SCRAPING_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 5,
  baseDelay: 2000, // 2초 (서버 부하 고려)
  maxDelay: 30000, // 30초
  backoffMultiplier: 1.5,
  retryableErrors: [
    'timeout',
    'network',
    'navigation',
    'waiting for selector',
    'Protocol error',
    'Page crashed',
    'Target closed'
  ]
};

/**
 * 에러가 재시도 가능한지 확인
 */
function isRetryableError(error: Error, retryableErrors: string[]): boolean {
  const errorMessage = error.message.toLowerCase();
  return retryableErrors.some(pattern => errorMessage.includes(pattern.toLowerCase()));
}

/**
 * 지수 백오프로 지연 시간 계산
 */
function calculateDelay(attempt: number, config: RetryConfig): number {
  const delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
  return Math.min(delay, config.maxDelay);
}

/**
 * Promise 기반 재시도 함수
 */
export async function retryAsync<T>(
  operation: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
  context: string = 'Operation'
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      console.log(`🔄 ${context} 시도 ${attempt}/${config.maxAttempts}`);
      
      const result = await operation();
      
      if (attempt > 1) {
        console.log(`✅ ${context} ${attempt}번째 시도에서 성공`);
      }
      
      return result;
      
    } catch (error) {
      lastError = error as Error;
      
      console.warn(`⚠️ ${context} ${attempt}번째 시도 실패:`, (error as Error).message);
      
      // 마지막 시도인 경우
      if (attempt === config.maxAttempts) {
        console.error(`❌ ${context} 모든 시도 실패 (${config.maxAttempts}/${config.maxAttempts})`);
        break;
      }
      
      // 재시도 불가능한 에러인 경우
      if (!isRetryableError(lastError, config.retryableErrors)) {
        console.error(`❌ ${context} 재시도 불가능한 에러:`, (error as Error).message);
        throw lastError;
      }
      
      // 다음 시도 전 지연
      const delay = calculateDelay(attempt, config);
      console.log(`⏳ ${delay}ms 후 재시도...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error('Unknown error occurred');
}

/**
 * 스크래핑 전용 재시도 래퍼
 */
export async function retryScrapingOperation<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  return retryAsync(operation, SCRAPING_RETRY_CONFIG, operationName);
}

/**
 * 재시도 가능한 함수로 변환하는 데코레이터
 */
export function withRetry<T extends unknown[], R>(
  config: RetryConfig = DEFAULT_RETRY_CONFIG
) {
  return function(
    target: unknown,
    propertyName: string,
    descriptor: TypedPropertyDescriptor<(...args: T) => Promise<R>>
  ) {
    const method = descriptor.value!;
    
    descriptor.value = async function(...args: T): Promise<R> {
      return retryAsync(
        () => method.apply(this, args),
        config,
        `${(target as { constructor: { name: string } }).constructor.name}.${propertyName}`
      );
    };
  };
}

/**
 * 조건부 재시도 (특정 조건에서만 재시도)
 */
export async function retryWhen<T>(
  operation: () => Promise<T>,
  condition: (error: Error, attempt: number) => boolean,
  maxAttempts: number = 3,
  delay: number = 1000,
  context: string = 'Conditional Operation'
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts || !condition(lastError, attempt)) {
        throw lastError;
      }
      
      console.warn(`⚠️ ${context} ${attempt}번째 시도 실패, 조건부 재시도:`, (error as Error).message);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error('Unknown error occurred');
}

/**
 * 회로 차단기 패턴 (Circuit Breaker)
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  constructor(
    private failureThreshold: number = 5,
    private recoveryTimeout: number = 60000 // 1분
  ) {}
  
  async execute<T>(operation: () => Promise<T>, context: string = 'Operation'): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'HALF_OPEN';
        console.log(`🔄 ${context} 회로 차단기 HALF_OPEN 상태로 전환`);
      } else {
        throw new Error(`${context} 회로 차단기 OPEN 상태 - 일시적으로 차단됨`);
      }
    }
    
    try {
      const result = await operation();
      
      if (this.state === 'HALF_OPEN') {
        this.state = 'CLOSED';
        this.failures = 0;
        console.log(`✅ ${context} 회로 차단기 CLOSED 상태로 복구`);
      }
      
      return result;
      
    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();
      
      if (this.failures >= this.failureThreshold) {
        this.state = 'OPEN';
        console.error(`🚨 ${context} 회로 차단기 OPEN 상태로 전환 (${this.failures}회 실패)`);
      }
      
      throw error;
    }
  }
  
  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime
    };
  }
  
  reset() {
    this.state = 'CLOSED';
    this.failures = 0;
    this.lastFailureTime = 0;
  }
}

/**
 * 글로벌 회로 차단기 인스턴스 (스크래핑용)
 */
export const scrapingCircuitBreaker = new CircuitBreaker(3, 30000); // 3회 실패, 30초 대기