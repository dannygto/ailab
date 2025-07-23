/**
 * TCP/Socket协议适配器 - 证书认证模块
 *
 * 本模块实现了基于证书的设备认证机制
 *
 * @version 1.0.0
 * @date 2025-07-23
 */

import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as tls from 'tls';

/**
 * 认证事件
 */
export enum AuthenticationEvents {
  /** 认证成功 */
  AUTH_SUCCESS = 'authSuccess',

  /** 认证失败 */
  AUTH_FAILURE = 'authFailure',

  /** 认证开始 */
  AUTH_STARTED = 'authStarted',

  /** 认证过期 */
  AUTH_EXPIRED = 'authExpired',

  /** 认证刷新 */
  AUTH_REFRESHED = 'authRefreshed',

  /** 认证撤销 */
  AUTH_REVOKED = 'authRevoked',

  /** 错误 */
  ERROR = 'error'
}

/**
 * 认证方法
 */
export enum AuthenticationMethod {
  /** 无认证 */
  NONE = 'none',

  /** 证书认证 */
  CERTIFICATE = 'certificate',

  /** 密钥认证 */
  KEY = 'key',

  /** 令牌认证 */
  TOKEN = 'token',

  /** 用户名密码认证 */
  USERNAME_PASSWORD = 'username_password',

  /** 多因素认证 */
  MULTI_FACTOR = 'multi_factor'
}

/**
 * 认证级别
 */
export enum AuthenticationLevel {
  /** 无认证 */
  NONE = 0,

  /** 基本认证 */
  BASIC = 1,

  /** 标准认证 */
  STANDARD = 2,

  /** 高级认证 */
  ADVANCED = 3,

  /** 最高级认证 */
  HIGHEST = 4
}

/**
 * 认证状态
 */
export enum AuthenticationStatus {
  /** 未认证 */
  UNAUTHENTICATED = 'unauthenticated',

  /** 认证中 */
  AUTHENTICATING = 'authenticating',

  /** 已认证 */
  AUTHENTICATED = 'authenticated',

  /** 认证失败 */
  FAILED = 'failed',

  /** 认证过期 */
  EXPIRED = 'expired',

  /** 认证撤销 */
  REVOKED = 'revoked'
}

/**
 * 证书认证配置
 */
export interface CertificateAuthenticationConfig {
  /** 证书目录 */
  certDir?: string;

  /** CA证书文件名 */
  caFile?: string;

  /** 客户端证书文件名 */
  certFile?: string;

  /** 客户端私钥文件名 */
  keyFile?: string;

  /** 私钥密码 */
  keyPassword?: string;

  /** 是否请求客户端证书 */
  requestCert?: boolean;

  /** 是否拒绝未经授权的客户端 */
  rejectUnauthorized?: boolean;

  /** 支持的密码套件 */
  ciphers?: string;

  /** 最低TLS版本 */
  minVersion?: string;

  /** 证书认证方法 */
  method?: AuthenticationMethod;

  /** 认证过期时间 (ms) */
  expiryTime?: number;

  /** 认证刷新间隔 (ms) */
  refreshInterval?: number;

  /** 是否启用证书撤销检查 */
  enableCRL?: boolean;

  /** 证书撤销列表文件 */
  crlFile?: string;

  /** 设备白名单 */
  deviceWhitelist?: string[];

  /** 证书颁发者白名单 */
  issuerWhitelist?: string[];
}

/**
 * 认证信息
 */
export interface AuthenticationInfo {
  /** 认证ID */
  id: string;

  /** 认证方法 */
  method: AuthenticationMethod;

  /** 认证级别 */
  level: AuthenticationLevel;

  /** 认证状态 */
  status: AuthenticationStatus;

  /** 认证时间 */
  authenticatedAt?: Date;

  /** 过期时间 */
  expiresAt?: Date;

  /** 最后刷新时间 */
  lastRefreshedAt?: Date;

  /** 设备ID */
  deviceId?: string;

  /** 证书信息 */
  certificate?: {
    /** 序列号 */
    serialNumber: string;

    /** 主题 */
    subject: string;

    /** 颁发者 */
    issuer: string;

    /** 有效期开始 */
    validFrom: Date;

    /** 有效期结束 */
    validTo: Date;

    /** 指纹 */
    fingerprint: string;
  };

  /** 令牌 */
  token?: string;

  /** 元数据 */
  metadata?: Record<string, any>;
}

/**
 * 认证结果
 */
export interface AuthenticationResult {
  /** 是否成功 */
  success: boolean;

  /** 认证信息 */
  info?: AuthenticationInfo;

  /** 错误信息 */
  error?: string;

  /** 错误代码 */
  errorCode?: number;
}

/**
 * 证书认证器
 *
 * 实现基于证书的设备认证
 */
export class CertificateAuthenticator extends EventEmitter {
  private config: CertificateAuthenticationConfig;
  private authenticationCache: Map<string, AuthenticationInfo>;
  private tlsOptions: tls.TlsOptions;
  private crlList: string[] | null;
  private refreshTimer: NodeJS.Timeout | null;

  /**
   * 创建证书认证器
   *
   * @param config 认证配置
   */
  constructor(config?: CertificateAuthenticationConfig) {
    super();

    this.config = {
      certDir: './certs',
      caFile: 'ca.crt',
      certFile: 'client.crt',
      keyFile: 'client.key',
      keyPassword: '',
      requestCert: true,
      rejectUnauthorized: true,
      ciphers: 'HIGH:!aNULL:!MD5',
      minVersion: 'TLSv1.2',
      method: AuthenticationMethod.CERTIFICATE,
      expiryTime: 24 * 60 * 60 * 1000, // 24小时
      refreshInterval: 60 * 60 * 1000, // 1小时
      enableCRL: false,
      crlFile: 'crl.pem',
      deviceWhitelist: [],
      issuerWhitelist: [],
      ...config
    };

    this.authenticationCache = new Map<string, AuthenticationInfo>();
    this.crlList = null;
    this.refreshTimer = null;
    this.tlsOptions = this.initializeTlsOptions();

    // 如果启用CRL，加载证书撤销列表
    if (this.config.enableCRL) {
      this.loadCRL();
    }

    // 启动认证刷新定时器
    this.startRefreshTimer();
  }

  /**
   * 初始化TLS选项
   *
   * @returns TLS选项
   */
  private initializeTlsOptions(): tls.TlsOptions {
    const options: tls.TlsOptions = {
      requestCert: this.config.requestCert,
      rejectUnauthorized: this.config.rejectUnauthorized,
      ciphers: this.config.ciphers,
      minVersion: this.config.minVersion as tls.SecureVersion
    };

    try {
      // 加载CA证书
      const caPath = path.resolve(this.config.certDir!, this.config.caFile!);
      if (fs.existsSync(caPath)) {
        options.ca = fs.readFileSync(caPath);
      }

      // 加载客户端证书
      const certPath = path.resolve(this.config.certDir!, this.config.certFile!);
      if (fs.existsSync(certPath)) {
        options.cert = fs.readFileSync(certPath);
      }

      // 加载客户端私钥
      const keyPath = path.resolve(this.config.certDir!, this.config.keyFile!);
      if (fs.existsSync(keyPath)) {
        options.key = fs.readFileSync(keyPath);

        // 如果有私钥密码
        if (this.config.keyPassword) {
          options.passphrase = this.config.keyPassword;
        }
      }
    } catch (error) {
      this.emit(AuthenticationEvents.ERROR, {
        message: '加载证书文件失败',
        error
      });
    }

    return options;
  }

  /**
   * 加载证书撤销列表
   */
  private loadCRL(): void {
    try {
      const crlPath = path.resolve(this.config.certDir!, this.config.crlFile!);
      if (fs.existsSync(crlPath)) {
        const crlData = fs.readFileSync(crlPath, 'utf8');
        this.crlList = crlData.split('\n').filter(line => line.trim().length > 0);
      } else {
        this.crlList = [];
      }
    } catch (error) {
      this.emit(AuthenticationEvents.ERROR, {
        message: '加载证书撤销列表失败',
        error
      });
      this.crlList = [];
    }
  }

  /**
   * 启动认证刷新定时器
   */
  private startRefreshTimer(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }

    this.refreshTimer = setInterval(() => {
      this.refreshAuthenticationCache();
    }, this.config.refreshInterval);
  }

  /**
   * 刷新认证缓存
   */
  private refreshAuthenticationCache(): void {
    const now = new Date();

    const authEntries = Array.from(this.authenticationCache.entries());
    for (const [id, authInfo] of authEntries) {
      // 检查是否过期
      if (authInfo.expiresAt && authInfo.expiresAt < now) {
        // 认证已过期，从缓存中移除
        this.authenticationCache.delete(id);

        // 发出过期事件
        this.emit(AuthenticationEvents.AUTH_EXPIRED, {
          id,
          info: authInfo
        });

        continue;
      }

      // 检查是否需要刷新
      if (authInfo.lastRefreshedAt &&
          (now.getTime() - authInfo.lastRefreshedAt.getTime()) >= this.config.refreshInterval!) {
        // 更新刷新时间
        authInfo.lastRefreshedAt = now;

        // 发出刷新事件
        this.emit(AuthenticationEvents.AUTH_REFRESHED, {
          id,
          info: authInfo
        });
      }
    }
  }

  /**
   * 清除过期的认证
   */
  public clearExpiredAuthentications(): void {
    const currentTime = new Date();

    const authEntries = Array.from(this.authenticationCache.entries());
    for (const [id, authInfo] of authEntries) {
      if (authInfo.expiresAt && authInfo.expiresAt < currentTime) {
        this.authenticationCache.delete(id);
      }
    }
  }

  /**
   * 验证客户端证书
   *
   * @param cert 证书对象
   * @param deviceId 设备ID
   * @returns 认证结果
   */
  public authenticateWithCertificate(cert: tls.PeerCertificate, deviceId?: string): AuthenticationResult {
    this.emit(AuthenticationEvents.AUTH_STARTED, {
      method: AuthenticationMethod.CERTIFICATE,
      deviceId
    });

    // 检查证书是否存在
    if (!cert) {
      const result: AuthenticationResult = {
        success: false,
        error: '未提供证书',
        errorCode: 401
      };

      this.emit(AuthenticationEvents.AUTH_FAILURE, result);
      return result;
    }

    try {
      // 检查证书有效期
      const validFrom = new Date(cert.valid_from);
      const validTo = new Date(cert.valid_to);
      const currentDate = new Date();

      if (currentDate < validFrom || currentDate > validTo) {
        const result: AuthenticationResult = {
          success: false,
          error: '证书已过期或尚未生效',
          errorCode: 403
        };

        this.emit(AuthenticationEvents.AUTH_FAILURE, result);
        return result;
      }

      // 检查证书是否被撤销
      if (this.config.enableCRL && this.crlList && this.crlList.includes(cert.serialNumber)) {
        const result: AuthenticationResult = {
          success: false,
          error: '证书已被撤销',
          errorCode: 403
        };

        this.emit(AuthenticationEvents.AUTH_FAILURE, result);
        return result;
      }

      // 检查设备白名单
      if (this.config.deviceWhitelist &&
          this.config.deviceWhitelist.length > 0 &&
          deviceId &&
          !this.config.deviceWhitelist.includes(deviceId)) {
        const result: AuthenticationResult = {
          success: false,
          error: '设备不在白名单中',
          errorCode: 403
        };

        this.emit(AuthenticationEvents.AUTH_FAILURE, result);
        return result;
      }

      // 检查颁发者白名单
      if (this.config.issuerWhitelist &&
          this.config.issuerWhitelist.length > 0 &&
          !this.config.issuerWhitelist.includes(cert.issuer.CN)) {
        const result: AuthenticationResult = {
          success: false,
          error: '证书颁发者不被信任',
          errorCode: 403
        };

        this.emit(AuthenticationEvents.AUTH_FAILURE, result);
        return result;
      }

      // 创建认证ID
      const authId = this.generateAuthenticationId(cert, deviceId);

      // 创建认证信息
      const authDate = new Date();
      const expiresAt = new Date(authDate.getTime() + this.config.expiryTime!);

      const authInfo: AuthenticationInfo = {
        id: authId,
        method: AuthenticationMethod.CERTIFICATE,
        level: AuthenticationLevel.ADVANCED,
        status: AuthenticationStatus.AUTHENTICATED,
        authenticatedAt: authDate,
        expiresAt,
        lastRefreshedAt: authDate,
        deviceId,
        certificate: {
          serialNumber: cert.serialNumber,
          subject: cert.subject.CN || cert.subject.O || '',
          issuer: cert.issuer.CN || cert.issuer.O || '',
          validFrom: validFrom,
          validTo: validTo,
          fingerprint: cert.fingerprint
        },
        metadata: {
          subjectAltName: cert.subjectaltname
        }
      };

      // 添加到认证缓存
      this.authenticationCache.set(authId, authInfo);

      // 创建认证结果
      const result: AuthenticationResult = {
        success: true,
        info: authInfo
      };

      // 发出认证成功事件
      this.emit(AuthenticationEvents.AUTH_SUCCESS, result);

      return result;
    } catch (error) {
      const result: AuthenticationResult = {
        success: false,
        error: `证书验证失败: ${error instanceof Error ? error.message : 'Unknown error'}`,
        errorCode: 500
      };

      this.emit(AuthenticationEvents.AUTH_FAILURE, result);
      return result;
    }
  }

  /**
   * 生成认证ID
   *
   * @param cert 证书对象
   * @param deviceId 设备ID
   * @returns 认证ID
   */
  private generateAuthenticationId(cert: tls.PeerCertificate, deviceId?: string): string {
    const idComponents = [
      cert.fingerprint,
      cert.serialNumber,
      deviceId || '',
      Date.now().toString()
    ];

    return crypto.createHash('sha256').update(idComponents.join('|')).digest('hex');
  }

  /**
   * 通过认证ID获取认证信息
   *
   * @param authId 认证ID
   * @returns 认证信息，如果不存在则返回null
   */
  public getAuthenticationById(authId: string): AuthenticationInfo | null {
    return this.authenticationCache.get(authId) || null;
  }

  /**
   * 通过设备ID获取认证信息
   *
   * @param deviceId 设备ID
   * @returns 认证信息，如果不存在则返回null
   */
  public getAuthenticationByDeviceId(deviceId: string): AuthenticationInfo | null {
    for (const authInfo of this.authenticationCache.values()) {
      if (authInfo.deviceId === deviceId) {
        return authInfo;
      }
    }

    return null;
  }

  /**
   * 验证认证是否有效
   *
   * @param authId 认证ID
   * @returns 是否有效
   */
  public isAuthenticationValid(authId: string): boolean {
    const authInfo = this.authenticationCache.get(authId);

    if (!authInfo) {
      return false;
    }

    // 检查状态
    if (authInfo.status !== AuthenticationStatus.AUTHENTICATED) {
      return false;
    }

    // 检查是否过期
    if (authInfo.expiresAt && authInfo.expiresAt < new Date()) {
      // 更新状态为过期
      authInfo.status = AuthenticationStatus.EXPIRED;
      return false;
    }

    return true;
  }

  /**
   * 撤销认证
   *
   * @param authId 认证ID
   * @returns 是否成功撤销
   */
  public revokeAuthentication(authId: string): boolean {
    const authInfo = this.authenticationCache.get(authId);

    if (!authInfo) {
      return false;
    }

    // 更新状态为撤销
    authInfo.status = AuthenticationStatus.REVOKED;

    // 从缓存中移除
    this.authenticationCache.delete(authId);

    // 发出撤销事件
    this.emit(AuthenticationEvents.AUTH_REVOKED, {
      id: authId,
      info: authInfo
    });

    return true;
  }

  /**
   * 获取TLS选项
   *
   * @returns TLS选项
   */
  public getTlsOptions(): tls.TlsOptions {
    return { ...this.tlsOptions };
  }

  /**
   * 获取所有有效的认证
   *
   * @returns 有效认证列表
   */
  public getValidAuthentications(): AuthenticationInfo[] {
    const validAuth: AuthenticationInfo[] = [];

    const authEntries = Array.from(this.authenticationCache.entries());
    for (const [authId, authInfo] of authEntries) {
      if (this.isAuthenticationValid(authId)) {
        validAuth.push(authInfo);
      }
    }

    return validAuth;
  }

  /**
   * 获取认证计数
   *
   * @returns 认证计数
   */
  public getAuthenticationCount(): { total: number; valid: number; expired: number; revoked: number } {
    let valid = 0;
    let expired = 0;
    let revoked = 0;

    for (const authInfo of this.authenticationCache.values()) {
      switch (authInfo.status) {
        case AuthenticationStatus.AUTHENTICATED:
          if (authInfo.expiresAt && authInfo.expiresAt < new Date()) {
            expired++;
          } else {
            valid++;
          }
          break;

        case AuthenticationStatus.EXPIRED:
          expired++;
          break;

        case AuthenticationStatus.REVOKED:
          revoked++;
          break;
      }
    }

    return {
      total: this.authenticationCache.size,
      valid,
      expired,
      revoked
    };
  }

  /**
   * 销毁认证器
   */
  public destroy(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }

    this.authenticationCache.clear();
    this.removeAllListeners();
  }
}

/**
 * 创建证书认证器的工厂函数
 *
 * @param config 认证配置
 * @returns 证书认证器实例
 */
export function createCertificateAuthenticator(config?: CertificateAuthenticationConfig): CertificateAuthenticator {
  return new CertificateAuthenticator(config);
}
