---
sidebar_position: 4
title: "Security Patterns"
description: "Security Patterns"
---
# 🔐 Cloud Security Patterns

## 1. 🛡️ Authentication Patterns

### 1.1 OAuth 2.0 / OpenID Connect Pattern

**Concept**: Implements secure authentication and authorization flows.

**Implementation Example**:
```java
@Configuration
@EnableWebSecurity
public class OAuth2SecurityConfig extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .oauth2Login()
                .authorizationEndpoint()
                    .baseUri("/oauth2/authorize")
                    .authorizationRequestRepository(authorizationRequestRepository())
                .and()
                .tokenEndpoint()
                    .accessTokenResponseClient(accessTokenResponseClient())
                .and()
                .userInfoEndpoint()
                    .userService(oauth2UserService())
            .and()
            .authorizeRequests()
                .antMatchers("/", "/login/**").permitAll()
                .anyRequest().authenticated();
    }

    @Bean
    public OAuth2UserService<OAuth2UserRequest, OAuth2User> oauth2UserService() {
        DefaultOAuth2UserService delegate = new DefaultOAuth2UserService();
        
        return request -> {
            OAuth2User user = delegate.loadUser(request);
            
            // Additional user processing
            return new CustomOAuth2User(user);
        };
    }
}

@Service
public class AuthenticationService {
    private final TokenProvider tokenProvider;
    
    public Authentication authenticate(String token) {
        if (tokenProvider.validateToken(token)) {
            Claims claims = tokenProvider.getClaims(token);
            return new UsernamePasswordAuthenticationToken(
                claims.getSubject(),
                null,
                extractAuthorities(claims)
            );
        }
        throw new InvalidTokenException("Invalid token");
    }
}
```

### 1.2 JWT Pattern

**Concept**: Secure token-based authentication.

**Implementation**:
```java
@Component
public class JwtTokenProvider {
    @Value("${jwt.secret}")
    private String jwtSecret;
    
    @Value("${jwt.expiration}")
    private long jwtExpiration;

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", userDetails.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .collect(Collectors.toList()));
            
        return Jwts.builder()
            .setClaims(claims)
            .setSubject(userDetails.getUsername())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
            .signWith(SignatureAlgorithm.HS512, jwtSecret)
            .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            throw new InvalidTokenException("Invalid JWT token");
        }
    }
}
```

## 2. 🛡️ Authorization Patterns

### 2.1 Role-Based Access Control (RBAC)

**Concept**: Controls access based on user roles.

**Implementation**:
```java
@Configuration
@EnableGlobalMethodSecurity(
    prePostEnabled = true,
    securedEnabled = true,
    jsr250Enabled = true
)
public class MethodSecurityConfig extends GlobalMethodSecurityConfiguration {
    @Override
    protected MethodSecurityExpressionHandler createExpressionHandler() {
        DefaultMethodSecurityExpressionHandler expressionHandler = 
            new DefaultMethodSecurityExpressionHandler();
        return expressionHandler;
    }
}

@Service
public class SecuredService {
    @PreAuthorize("hasRole('ADMIN')")
    public void adminOperation() {
        // Admin only operation
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public void userOperation() {
        // User or admin operation
    }

    @PostAuthorize("returnObject.owner == authentication.name")
    public Resource accessResource(Long resourceId) {
        // Return resource only if user owns it
        return resourceRepository.findById(resourceId);
    }
}
```

### 2.2 Attribute-Based Access Control (ABAC)

**Concept**: Fine-grained access control based on attributes.

**Implementation**:
```java
@Component
public class AbacAuthorizationManager {
    public boolean checkAccess(
            Authentication authentication,
            Object resource,
            String action) {
        
        User user = (User) authentication.getPrincipal();
        PolicyDecision decision = evaluatePolicy(user, resource, action);
        
        return decision.isAllowed();
    }

    private PolicyDecision evaluatePolicy(
            User user, 
            Object resource,
            String action) {
        
        List<PolicyRule> rules = policyRepository
            .findApplicableRules(user, resource, action);
            
        return rules.stream()
            .map(rule -> rule.evaluate(user, resource, action))
            .reduce(PolicyDecision.DENY, PolicyDecision::combine);
    }
}

@Service
public class ResourceService {
    private final AbacAuthorizationManager abacManager;

    public Resource accessResource(
            Authentication auth,
            Long resourceId,
            String action) {
        
        Resource resource = resourceRepository.findById(resourceId);
        
        if (!abacManager.checkAccess(auth, resource, action)) {
            throw new AccessDeniedException("Access denied");
        }
        
        return resource;
    }
}
```

## 3. 🔒 Data Protection Patterns

### 3.1 Encryption at Rest

**Concept**: Protects stored data through encryption.

**Implementation**:
```java
@Configuration
public class EncryptionConfig {
    @Bean
    public StringEncryptor stringEncryptor() {
        PooledPBEStringEncryptor encryptor = new PooledPBEStringEncryptor();
        SimpleStringPBEConfig config = new SimpleStringPBEConfig();
        config.setPassword(encryptionKey);
        config.setAlgorithm("PBEWithHMACSHA512AndAES_256");
        config.setKeyObtentionIterations("1000");
        config.setPoolSize("1");
        encryptor.setConfig(config);
        return encryptor;
    }
}

@Entity
public class SensitiveData {
    @Convert(converter = AttributeEncryptor.class)
    private String sensitiveField;
}

@Converter
public class AttributeEncryptor 
        implements AttributeConverter<String, String> {
    
    private final StringEncryptor encryptor;

    @Override
    public String convertToDatabaseColumn(String attribute) {
        return attribute != null ? encryptor.encrypt(attribute) : null;
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        return dbData != null ? encryptor.decrypt(dbData) : null;
    }
}
```

### 3.2 Data Masking

**Concept**: Hides sensitive data from unauthorized viewers.

**Implementation**:
```java
@Component
public class DataMasker {
    public String maskCreditCard(String creditCard) {
        if (creditCard == null) return null;
        return creditCard.replaceAll(
            "(?<=.{4}).*(?=.{4})", 
            m -> "*".repeat(m.length())
        );
    }

    public String maskEmail(String email) {
        if (email == null) return null;
        String[] parts = email.split("@");
        if (parts.length != 2) return email;
        
        String name = parts[0];
        String domain = parts[1];
        
        String maskedName = name.charAt(0) + 
            "*".repeat(name.length() - 2) + 
            name.charAt(name.length() - 1);
            
        return maskedName + "@" + domain;
    }
}

@JsonSerialize(using = SensitiveDataSerializer.class)
public class UserData {
    private String creditCard;
    private String email;
}

public class SensitiveDataSerializer 
        extends JsonSerializer<UserData> {
    
    private final DataMasker dataMasker;

    @Override
    public void serialize(
            UserData value, 
            JsonGenerator gen, 
            SerializerProvider provider) throws IOException {
        
        gen.writeStartObject();
        gen.writeStringField("creditCard", 
            dataMasker.maskCreditCard(value.getCreditCard()));
        gen.writeStringField("email", 
            dataMasker.maskEmail(value.getEmail()));
        gen.writeEndObject();
    }
}
```

## 4. 🌐 Network Security Patterns

### 4.1 API Gateway Security

**Concept**: Centralizes authentication and authorization for APIs.

**Implementation**:
```java
@Configuration
public class ApiGatewayConfig {
    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(
            ServerHttpSecurity http) {
        return http
            .csrf().disable()
            .authorizeExchange()
                .pathMatchers("/public/**").permitAll()
                .anyExchange().authenticated()
            .and()
            .oauth2ResourceServer()
                .jwt()
                .and()
            .and()
            .build();
    }

    @Bean
    public RouteLocator customRouteLocator(
            RouteLocatorBuilder builder) {
        return builder.routes()
            .route("secure_route", r -> r
                .path("/api/**")
                .filters(f -> f
                    .rewritePath("/api/(?<segment>.*)", "/${segment}")
                    .addRequestHeader("X-Forwarded-For", "gateway")
                    .requestRateLimiter(c -> c
                        .setRateLimiter(redisRateLimiter())
                        .setStatusCode(HttpStatus.TOO_MANY_REQUESTS)))
                .uri("lb://internal-service"))
            .build();
    }
}
```

### 4.2 TLS Termination

**Concept**: Handles SSL/TLS encryption at the edge.

**Implementation**:
```yaml
# Kubernetes Ingress configuration
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: tls-ingress
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - secure.example.com
    secretName: tls-secret
  rules:
  - host: secure.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 80
```

## 5. 🔍 Monitoring and Audit Patterns

### 5.1 Security Event Logging

**Concept**: Tracks and logs security-related events.

**Implementation**:
```java
@Aspect
@Component
public class SecurityAuditAspect {
    private final AuditEventRepository auditRepository;

    @Around("@annotation(Audited)")
    public Object auditMethod(ProceedingJoinPoint joinPoint) 
            throws Throwable {
        String methodName = joinPoint.getSignature().getName();
        Authentication auth = SecurityContextHolder
            .getContext()
            .getAuthentication();
            
        AuditEvent event = new AuditEvent(
            auth.getName(),
            "METHOD_ACCESS",
            Map.of(
                "method", methodName,
                "timestamp", Instant.now().toString()
            )
        );

        try {
            Object result = joinPoint.proceed();
            event.getData().put("status", "SUCCESS");
            return result;
        } catch (Exception e) {
            event.getData().put("status", "FAILURE");
            event.getData().put("error", e.getMessage());
            throw e;
        } finally {
            auditRepository.add(event);
        }
    }
}
```

### 5.2 Intrusion Detection

**Concept**: Detects and responds to suspicious activities.

**Implementation**:
```java
@Component
public class SecurityMonitor {
    private final MeterRegistry registry;
    private final NotificationService notificationService;

    @EventListener
    public void onAuthenticationFailure(
            AuthenticationFailureBadCredentialsEvent event) {
        
        String username = event.getAuthentication().getName();
        String ip = extractIpAddress(event);
        
        Counter.builder("security.auth.failure")
            .tag("username", username)
            .tag("ip", ip)
            .register(registry)
            .increment();
            
        checkBruteForceAttempt(username, ip);
    }

    private void checkBruteForceAttempt(String username, String ip) {
        long failureCount = registry.get("security.auth.failure")
            .tag("username", username)
            .tag("ip", ip)
            .counter()
            .count();
            
        if (failureCount > 5) {
            notificationService.sendAlert(
                "Possible brute force attempt",
                Map.of(
                    "username", username,
                    "ip", ip,
                    "attempts", failureCount
                )
            );
        }
    }
}
```

## 6. Best Practices

1. **Defense in Depth**
    - Implement multiple security layers
    - Use secure defaults
    - Follow least privilege principle

2. **Security Monitoring**
    - Enable comprehensive logging
    - Monitor security events
    - Set up alerts for suspicious activity

3. **Data Protection**
    - Encrypt sensitive data
    - Implement proper key management
    - Use secure communication channels

4. **Access Control**
    - Implement strong authentication
    - Use fine-grained authorization
    - Regularly review access rights

## 7. References

- OWASP Security Patterns
- Cloud Security Alliance Guidelines
- NIST Cybersecurity Framework
- AWS Security Best Practices
- Azure Security Documentation