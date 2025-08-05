// 3단계 캐싱 시스템 관리자

/**
 * 캐시 레벨 정의
 * Level 1: 메모리 캐시 (즉시 응답, 5분 TTL)
 * Level 2: 로컬 스토리지 캐시 (빠른 응답, 1시간 TTL)
 * Level 3: 데이터베이스/파일 캐시 (안정적, 24시간 TTL)
 */
export enum CacheLevel {
  MEMORY = 1,    // Redis/메모리 - 초고속
  LOCAL = 2,     // 로컬 스토리지 - 고속
  PERSISTENT = 3 // 파일/DB - 안정적
}

/**
 * 캐시 엔트리 타입
 */
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  level: CacheLevel;
  key: string;
  metadata?: {
    source: string;
    computationTime?: number;
    hitCount?: number;
    lastAccessed?: number;
  };
}

/**
 * 캐시 설정
 */
export interface CacheConfig {
  memory: {
    enabled: boolean;
    maxSize: number;    // MB
    defaultTTL: number; // 밀리초
  };
  local: {
    enabled: boolean;
    maxSize: number;    // MB
    defaultTTL: number; // 밀리초
  };
  persistent: {
    enabled: boolean;
    maxSize: number;    // MB
    defaultTTL: number; // 밀리초
    directory: string;
  };
}

/**
 * 캐시 통계
 */
export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalRequests: number;
  memoryUsage: number;
  storageUsage: number;
  lastCleanup: number;
}

/**
 * 3단계 캐싱 시스템 매니저
 */
export class CacheManager {
  private static instance: CacheManager;
  private memoryCache: Map<string, CacheEntry<unknown>>;
  private config: CacheConfig;
  private stats: CacheStats;
  private cleanupInterval: NodeJS.Timeout | null = null;

  private constructor(config: CacheConfig) {
    this.config = config;
    this.memoryCache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalRequests: 0,
      memoryUsage: 0,
      storageUsage: 0,
      lastCleanup: Date.now()
    };

    // 자동 정리 작업 시작
    this.startCleanupScheduler();
  }

  /**
   * 싱글톤 인스턴스 가져오기
   */
  static getInstance(config?: CacheConfig): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager(config || CacheManager.getDefaultConfig());
    }
    return CacheManager.instance;
  }

  /**
   * 기본 캐시 설정
   */
  static getDefaultConfig(): CacheConfig {
    return {
      memory: {
        enabled: true,
        maxSize: 50, // 50MB
        defaultTTL: 5 * 60 * 1000 // 5분
      },
      local: {
        enabled: true,
        maxSize: 200, // 200MB
        defaultTTL: 60 * 60 * 1000 // 1시간
      },
      persistent: {
        enabled: true,
        maxSize: 1000, // 1GB
        defaultTTL: 24 * 60 * 60 * 1000, // 24시간
        directory: './data/cache'
      }
    };
  }

  /**
   * 캐시에서 데이터 조회 (3단계 폴백)
   */
  async get<T>(key: string): Promise<T | null> {
    this.stats.totalRequests++;
    
    try {
      // Level 1: 메모리 캐시 확인
      if (this.config.memory.enabled) {
        const memoryResult = this.getFromMemory<T>(key);
        if (memoryResult) {
          this.stats.hits++;
          this.updateHitRate();
          return memoryResult;
        }
      }

      // Level 2: 로컬 스토리지 확인
      if (this.config.local.enabled) {
        const localResult = await this.getFromLocal<T>(key);
        if (localResult) {
          // 메모리 캐시에 복사 (성능 향상)
          await this.setInMemory(key, localResult, this.config.memory.defaultTTL);
          this.stats.hits++;
          this.updateHitRate();
          return localResult;
        }
      }

      // Level 3: 영구 저장소 확인
      if (this.config.persistent.enabled) {
        const persistentResult = await this.getFromPersistent<T>(key);
        if (persistentResult) {
          // 상위 레벨 캐시에 복사
          await this.setInMemory(key, persistentResult, this.config.memory.defaultTTL);
          await this.setInLocal(key, persistentResult, this.config.local.defaultTTL);
          this.stats.hits++;
          this.updateHitRate();
          return persistentResult;
        }
      }

      this.stats.misses++;
      this.updateHitRate();
      return null;

    } catch (error) {
      console.error('캐시 조회 오류:', error);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }
  }

  /**
   * 캐시에 데이터 저장 (모든 레벨에 저장)
   */
  async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    try {
      // 모든 활성화된 캐시 레벨에 저장
      if (this.config.memory.enabled) {
        await this.setInMemory(key, data, ttl || this.config.memory.defaultTTL);
      }

      if (this.config.local.enabled) {
        await this.setInLocal(key, data, ttl || this.config.local.defaultTTL);
      }

      if (this.config.persistent.enabled) {
        await this.setInPersistent(key, data, ttl || this.config.persistent.defaultTTL);
      }

      console.log(`✅ 캐시 저장 완료: ${key} (${this.getDataSize(data)}KB)`);
    } catch (error) {
      console.error('캐시 저장 오류:', error);
      throw error;
    }
  }

  /**
   * 캐시 무효화 (모든 레벨)
   */
  async invalidate(key: string): Promise<void> {
    try {
      // 모든 레벨에서 제거
      this.memoryCache.delete(key);
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`cache_${key}`);
      }

      // 파일 캐시는 다음 정리 작업에서 처리
      console.log(`🗑️ 캐시 무효화: ${key}`);
    } catch (error) {
      console.error('캐시 무효화 오류:', error);
    }
  }

  /**
   * 특정 패턴의 캐시 무효화
   */
  async invalidatePattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern);
    
    // 메모리 캐시에서 패턴 매칭 키들 제거
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    }

    // 로컬 스토리지에서 패턴 매칭 키들 제거
    if (typeof window !== 'undefined') {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('cache_') && regex.test(key.slice(6))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }

    console.log(`🗑️ 패턴 캐시 무효화: ${pattern}`);
  }

  /**
   * 메모리 캐시에서 조회
   */
  private getFromMemory<T>(key: string): T | null {
    const entry = this.memoryCache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.memoryCache.delete(key);
      return null;
    }

    // 접근 시간 업데이트
    if (entry.metadata) {
      entry.metadata.lastAccessed = now;
      entry.metadata.hitCount = (entry.metadata.hitCount || 0) + 1;
    }

    return entry.data as T;
  }

  /**
   * 로컬 스토리지에서 조회
   */
  private async getFromLocal<T>(key: string): Promise<T | null> {
    if (typeof window === 'undefined') return null;

    try {
      const item = localStorage.getItem(`cache_${key}`);
      if (!item) return null;

      const entry: CacheEntry<T> = JSON.parse(item);
      const now = Date.now();

      if (now - entry.timestamp > entry.ttl) {
        localStorage.removeItem(`cache_${key}`);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error('로컬 캐시 조회 오류:', error);
      return null;
    }
  }

  /**
   * 영구 저장소에서 조회
   */
  private async getFromPersistent<T>(key: string): Promise<T | null> {
    try {
      // Node.js 환경에서만 파일 시스템 사용
      if (typeof window !== 'undefined') return null;

      const fs = await import('fs/promises');
      const path = await import('path');
      
      const filePath = path.join(this.config.persistent.directory, `${key}.json`);
      
      try {
        const data = await fs.readFile(filePath, 'utf-8');
        const entry: CacheEntry<T> = JSON.parse(data);
        const now = Date.now();

        if (now - entry.timestamp > entry.ttl) {
          await fs.unlink(filePath);
          return null;
        }

        return entry.data;
      } catch {
        // 파일이 없거나 읽기 실패
        return null;
      }
    } catch (error) {
      console.error('영구 캐시 조회 오류:', error);
      return null;
    }
  }

  /**
   * 메모리 캐시에 저장
   */
  private async setInMemory<T>(key: string, data: T, ttl: number): Promise<void> {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      level: CacheLevel.MEMORY,
      key,
      metadata: {
        source: 'memory',
        hitCount: 0,
        lastAccessed: Date.now()
      }
    };

    this.memoryCache.set(key, entry);
    this.updateMemoryUsage();
  }

  /**
   * 로컬 스토리지에 저장
   */
  private async setInLocal<T>(key: string, data: T, ttl: number): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
        level: CacheLevel.LOCAL,
        key,
        metadata: {
          source: 'local'
        }
      };

      localStorage.setItem(`cache_${key}`, JSON.stringify(entry));
    } catch (error) {
      console.error('로컬 캐시 저장 오류:', error);
    }
  }

  /**
   * 영구 저장소에 저장
   */
  private async setInPersistent<T>(key: string, data: T, ttl: number): Promise<void> {
    try {
      // Node.js 환경에서만 파일 시스템 사용
      if (typeof window !== 'undefined') return;

      const fs = await import('fs/promises');
      const path = await import('path');
      
      const cacheDir = this.config.persistent.directory;
      
      // 디렉토리 생성
      try {
        await fs.mkdir(cacheDir, { recursive: true });
      } catch {
        // 디렉토리가 이미 존재하는 경우 무시
      }

      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
        level: CacheLevel.PERSISTENT,
        key,
        metadata: {
          source: 'persistent'
        }
      };

      const filePath = path.join(cacheDir, `${key}.json`);
      await fs.writeFile(filePath, JSON.stringify(entry, null, 2));
    } catch (error) {
      console.error('영구 캐시 저장 오류:', error);
    }
  }

  /**
   * 캐시 통계 업데이트
   */
  private updateHitRate(): void {
    this.stats.hitRate = this.stats.totalRequests > 0 
      ? (this.stats.hits / this.stats.totalRequests) * 100 
      : 0;
  }

  /**
   * 메모리 사용량 업데이트
   */
  private updateMemoryUsage(): void {
    let totalSize = 0;
    for (const entry of this.memoryCache.values()) {
      totalSize += this.getDataSize(entry.data);
    }
    this.stats.memoryUsage = totalSize;
  }

  /**
   * 데이터 크기 계산 (KB)
   */
  private getDataSize(data: unknown): number {
    try {
      return new Blob([JSON.stringify(data)]).size / 1024;
    } catch {
      return 0;
    }
  }

  /**
   * 자동 정리 스케줄러 시작
   */
  private startCleanupScheduler(): void {
    // 10분마다 정리 작업 실행
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 10 * 60 * 1000);
  }

  /**
   * 만료된 캐시 정리
   */
  private async cleanup(): Promise<void> {
    const now = Date.now();
    let cleanedCount = 0;

    // 메모리 캐시 정리
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.memoryCache.delete(key);
        cleanedCount++;
      }
    }

    // 로컬 스토리지 정리
    if (typeof window !== 'undefined') {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('cache_')) {
          try {
            const item = localStorage.getItem(key);
            if (item) {
              const entry = JSON.parse(item);
              if (now - entry.timestamp > entry.ttl) {
                keysToRemove.push(key);
              }
            }
          } catch {
            keysToRemove.push(key); // 손상된 항목 제거
          }
        }
      }
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        cleanedCount++;
      });
    }

    this.stats.lastCleanup = now;
    this.updateMemoryUsage();

    if (cleanedCount > 0) {
      console.log(`🧹 캐시 정리 완료: ${cleanedCount}개 항목 제거`);
    }
  }

  /**
   * 캐시 통계 조회
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * 캐시 설정 조회
   */
  getConfig(): CacheConfig {
    return { ...this.config };
  }

  /**
   * 리소스 정리
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.memoryCache.clear();
  }
}

// 기본 인스턴스 내보내기
export const cacheManager = CacheManager.getInstance();