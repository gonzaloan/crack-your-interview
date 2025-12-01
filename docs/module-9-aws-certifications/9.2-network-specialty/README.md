# AWS Advanced Networking Specialty - Exam Guide

## Network Fundamentals

### OSI Model - Layer Mapping
- L7 (Application): ALB, WAF, CloudFront
- L4 (Transport): NLB, Security Groups (port filtering)
- L3 (Network): VPC routing, NACLs, Transit Gateway, NAT Gateway
- L2 (Data Link): ENA, Direct Connect cross-connect

### TCP/IP Core
- **Ephemeral ports**: 1024-65535 (Linux uses 32768-60999)
- **Connection tracking**: Stateful = auto-allows return traffic
- **ICMP**: Type 3 (unreachable), Type 8 (echo request), Type 0 (echo reply)

### CIDR

| CIDR | IPs | AWS Usable | Use Case |
|------|-----|------------|----------|
| /28 | 16 | 11 | Min VPC subnet size |
| /27 | 32 | 27 | Small subnet |
| /26 | 64 | 59 | |
| /25 | 128 | 123 | |
| /24 | 256 | 251 | Standard subnet |
| /23 | 512 | 507 | |
| /22 | 1024 | 1019 | |
| /20 | 4096 | 4091 | Large subnet |
| /16 | 65536 | 65531 | Max VPC size |

**AWS Reserved IPs** (per subnet):
- .0 = Network
- .1 = VPC router
- .2 = DNS
- .3 = Future
- .255 = Broadcast

**RFC 1918**:
- 10.0.0.0/8
- 172.16.0.0/12
- 192.168.0.0/16

### BGP

**Port**: TCP 179

**Path Selection Order**:
1. Weight (Cisco only, higher wins, local only)
2. Local Preference (higher wins, within AS)
3. Locally originated routes
4. AS Path Length (shorter wins)
5. Origin (IGP > EGP > Incomplete)
6. MED (lower wins, between ASs)
7. eBGP > iBGP
8. Lowest IGP metric to next hop
9. Lowest router ID

**AWS BGP**:
- VGW default ASN: 7224 (can customize 64512-65534 for private, or use public ASN)
- Private ASN: 64512-65534 (16-bit), 4200000000-4294967294 (32-bit)
- Maximum prefixes: 100 per BGP session
- BGP timers: Keepalive 30s, Hold time 90s

**Key Attributes**:
- **AS_PATH**: List of ASNs, prepend to deprioritize path
- **LOCAL_PREF**: Outbound traffic preference (higher = preferred)
- **MED**: Inbound traffic preference (lower = preferred)
- **Community**: Tags for route manipulation

---

## VPC

### Limits (Default/Max)

| Resource | Limit | Soft/Hard |
|----------|-------|-----------|
| VPCs per region | 5 | Soft |
| Subnets per VPC | 200 | Soft |
| CIDR blocks per VPC | 5 | Soft (max 5) |
| Route tables per VPC | 200 | Soft |
| Routes per route table | 50 | Soft (max 1000) |
| Security groups per VPC | 2500 | Soft (max 10000) |
| Rules per security group | 60 in + 60 out | Soft (max 120 each) |
| Security groups per ENI | 5 | Soft (max 16) |
| Network ACLs per VPC | 200 | Soft |
| Rules per NACL | 20 | Soft (max 40) |
| Active VPC peering connections | 125 | Soft |
| IPv4 CIDR blocks per VPC | 5 | Hard |
| VPC endpoints per VPC | No limit | - |
| NAT Gateways per AZ | 5 | Soft |
| Internet Gateways per region | 5 per VPC (1 per VPC) | - |

### VPC CIDR
- Min: /28 (16 IPs)
- Max: /16 (65,536 IPs)
- Primary CIDR: Cannot change after creation
- Secondary CIDRs: Can add up to 4 (total 5)
- Cannot overlap with existing CIDRs in peered/connected VPCs
- Can use non-RFC 1918 (100.64.0.0/10 for carrier-grade NAT)

### Default VPC
- CIDR: 172.31.0.0/16
- One per region
- IGW attached
- Default route to IGW
- Auto-assign public IP enabled
- Default security group, NACL, route table

### Subnets
- Bound to single AZ (cannot span AZs)
- Cannot modify CIDR after creation
- Cannot overlap within VPC
- Minimum size: /28 (16 IPs, 11 usable)
- Public subnet = route to IGW (0.0.0.0/0 -> igw-xxx)

### Route Tables

**Route Priority**:
1. Longest prefix match (/32 > /24 > /16 > /0)
2. If same prefix:
   - Local (VPC CIDR) always wins
   - Propagated routes from DX Gateway > VGW
   - Static routes > propagated routes
   - Longest prefix in propagated routes

**Types**:
- **Main**: Default for all subnets without explicit association
- **Custom**: Explicitly associated with subnets
- **Gateway Route Table**: Associated with IGW/VGW for ingress routing
- **Local Gateway Route Table**: For Outposts

**Route Propagation**:
- VGW: Auto-propagates VPN/DX learned routes
- Transit Gateway: Auto-propagates attachment routes
- Enable per route table

**Edge Association** (IGW/VGW route table):
- Intercept traffic entering VPC
- Send to middlebox (firewall, IDS)
- Before routing to target subnet

### ENI

**Attributes**:
- Primary private IPv4 (cannot change)
- Secondary private IPv4 (can add/remove)
- One EIP per private IPv4
- One public IPv4 (dynamic, lost on stop)
- IPv6 addresses
- MAC address (persists)
- Source/dest check (default: enabled)
- Security groups (max 5, can increase to 16)

**Operations**:
- Hot attach: Running instance
- Warm attach: Stopped instance
- Cold attach: Launch
- Detach: Can move to another instance in same AZ

**Source/Dest Check**:
- Default: Enabled (drops traffic not destined for instance)
- Disable for: NAT instances, routers, firewalls, proxy servers

---

## IP Addressing

### Elastic IP
- Static public IPv4
- Charged when allocated but not associated
- Associated: No charge for first EIP per running instance
- Limit: 5 per region (soft)
- Regional resource
- Can remap in seconds (HA)
- Released when unallocated

### BYOIP
- Min: /24 IPv4, /48 IPv6
- Requires ROA (Route Origin Authorization) in RPKI
- Cannot split across regions
- Cannot share with other accounts
- Use case: IP reputation, whitelisting

### IPv6
- All addresses are public (globally unique)
- VPC: /56 CIDR (AWS assigns)
- Subnet: /64 CIDR
- Free
- No NAT (use Egress-Only IGW for outbound-only)
- Can coexist with IPv4 (dual-stack)
- Cannot convert IPv4-only VPC to IPv6 (must recreate)

---

## Internet Connectivity

### Internet Gateway
- Horizontally scaled, redundant, HA
- No bandwidth limit
- One per VPC
- Performs 1:1 NAT for instances with public IP
- Supports IPv4 and IPv6

### NAT Gateway

**Specs**:
- Bandwidth: 5 Gbps, auto-scales to 45 Gbps
- Bursts: Up to 100 Gbps
- Concurrent connections: 55,000 per unique destination
- Connection timeout: 350 seconds (idle)
- No security groups (managed service)

**Characteristics**:
- AZ-specific (create one per AZ for HA)
- Requires EIP
- Supports TCP, UDP, ICMP
- Does NOT support: Port forwarding, bastion, traffic metrics per instance
- Charged: Per hour + per GB processed

**HA Design**:
- Deploy one NAT GW per AZ
- Each AZ's private subnets route to local NAT GW
- If one fails, only that AZ affected

**CloudWatch Metrics**:
- BytesInFromDestination/BytesOutToDestination
- BytesInFromSource/BytesOutToSource
- PacketsInFromDestination/PacketsOutToDestination
- ActiveConnectionCount
- ConnectionAttemptCount/ConnectionEstablishedCount
- ErrorPortAllocation
- IdleTimeoutCount
- PacketsDropCount

### NAT Instance vs NAT Gateway

| Feature | NAT Instance | NAT Gateway |
|---------|--------------|-------------|
| Bandwidth | Instance type limit | 45 Gbps |
| HA | Manual | Automatic per AZ |
| Management | Customer | AWS |
| Security Groups | Yes | No |
| Bastion | Yes | No |
| Port Forwarding | Yes | No |
| Cost (low traffic) | Lower | Higher |
| Source/Dest Check | Must disable | N/A |

### Egress-Only Internet Gateway
- IPv6 only
- Stateful (allows return traffic)
- Free
- Prevents inbound IPv6 connections
- Route: ::/0 -> eigw-xxx

---

## VPC Connectivity

### VPC Peering

**Characteristics**:
- 1:1 relationship (A-B only)
- Non-transitive (A-B, B-C ≠ A-C)
- No overlapping CIDRs
- Cross-region supported (encrypted)
- Cross-account supported
- No bandwidth limit
- No single point of failure
- Limit: 125 peerings per VPC

**Restrictions** (No Edge-to-Edge Routing):
- Cannot access peer's IGW
- Cannot access peer's NAT GW
- Cannot access peer's VGW/VPN
- Cannot access peer's VPC endpoints (except interface endpoints if explicitly allowed)

**Configuration**:
1. Create peering request (requester)
2. Accept request (accepter)
3. Add routes in both VPCs (peer CIDR -> pcx-xxx)
4. Update security groups (allow peer SG or CIDR)

**DNS Resolution Over Peering**:
- Enable "Allow DNS resolution" on both sides
- Allows private hosted zone queries across peering
- Requires enableDnsHostnames and enableDnsSupport

### Transit Gateway

**Specs**:
- Max attachments: 5000 per TGW
- Bandwidth per VPC attachment: 50 Gbps (can burst to 100 Gbps)
- Bandwidth per VPN attachment: 1.25 Gbps per tunnel (ECMP for aggregate)
- Packet rate: 1 million PPS per VPC attachment
- MTU: 8500 bytes (within same AZ)

**Attachment Types**:
- VPC
- VPN (static or BGP)
- DX Gateway (via Transit VIF)
- TGW Peering (cross-region)
- Connect (SD-WAN, GRE, third-party)

**Route Tables**:
- Multiple route tables for isolation
- Default association/propagation route table
- Appliance mode (for stateful firewalls)
- Blackhole route (drop traffic)

**Multicast**:
- IGMP v2 support
- Up to 10,000 multicast groups
- Multicast domain = isolated boundary

**Route Domains** (Network Segmentation):
- Separate TGW route tables
- Each attachment associated with one route table
- Allows VPC isolation (prod/dev/shared-services)

**ECMP** (Equal-Cost Multi-Path):
- VPN attachments only
- Up to 8 VPN tunnels
- Aggregate bandwidth (8 × 1.25 Gbps = 10 Gbps)
- Load balancing per flow (5-tuple hash)

**Appliance Mode**:
- Ensures symmetric routing through stateful appliances
- Disables ECMP for appliance attachment
- Source/dest IP preserved

**Inter-Region Peering**:
- Encrypted
- Uses AWS backbone
- Supports same features as intra-region
- Peering attachments per TGW: 50

**Pricing**:
- Per attachment hour
- Per GB processed

### VPC Endpoints

**Gateway Endpoints**:
- **Services**: S3, DynamoDB only
- **Cost**: Free
- **Target**: Route table entry (pl-xxx)
- **Scope**: Regional (same region only)
- **HA**: Automatic
- **Cannot access from**: On-prem, peered VPC, different region

**Interface Endpoints** (PrivateLink):
- **Services**: 100+ AWS services + SaaS
- **Cost**: $0.01/hour per AZ + $0.01/GB processed
- **Target**: ENI with private IP
- **Scope**: VPC (can access from on-prem via DX/VPN)
- **HA**: Deploy in multiple AZs
- **DNS**: Private DNS (service.region.amazonaws.com -> private IP)
- **Security**: Security groups

**Private DNS**:
- Requires enableDnsHostnames + enableDnsSupport
- Cannot use with Route 53 Resolver outbound endpoints (conflict)

**Endpoint Policy**:
- IAM policy (who can use endpoint, what actions)
- Default: Allow all
- Does NOT replace resource policies

**Gateway Endpoint vs Interface Endpoint**:

| Feature | Gateway | Interface |
|---------|---------|-----------|
| Services | S3, DynamoDB | Most AWS services |
| Cost | Free | Paid |
| Implementation | Route table | ENI |
| On-prem access | No | Yes |
| Security group | No | Yes |
| Private DNS | No | Yes |

**Gateway Load Balancer Endpoint** (GWLBE):
- For Gateway Load Balancer
- Transparent inline traffic inspection
- GENEVE protocol

### PrivateLink

**Architecture**:
- Provider: NLB + VPC Endpoint Service
- Consumer: Interface VPC Endpoint

**Characteristics**:
- Consumer-initiated connection
- Provider approves/rejects requests
- Cross-account, cross-VPC (no peering needed)
- Scalable (AWS managed)
- HA (multi-AZ NLB)
- One-way traffic (consumer -> provider)

**Configuration** (Provider):
1. Create NLB
2. Create VPC Endpoint Service (select NLB)
3. Allow principals (AWS accounts, IAM users/roles)
4. Accept/reject connection requests (optional auto-accept)

**Configuration** (Consumer):
1. Create interface VPC endpoint
2. Specify service name (com.amazonaws.vpce.region.vpce-svc-xxx)
3. Select subnets and security groups

**DNS**:
- Provider can enable private DNS name (custom domain)
- Requires domain verification (TXT record)
- Consumer resolves provider's domain to private IP

**Use Cases**:
- SaaS (expose API to customers)
- Shared services (central AD, monitoring)
- Multi-account access without peering

---

## Hybrid Connectivity

### Site-to-Site VPN

**Components**:
- Virtual Private Gateway (VGW): AWS-side
- Customer Gateway (CGW): Customer-side metadata
- VPN Connection: Tunnels + config

**Specs**:
- Bandwidth: 1.25 Gbps per tunnel (after overhead ~1.15 Gbps)
- Tunnels: 2 per VPN connection (HA)
- Latency: Internet-dependent (variable)
- Encryption: AES-128, AES-256, AES-128-GCM, AES-256-GCM
- DH groups: 2, 14-24
- IKE: v1 or v2
- Perfect Forward Secrecy (PFS): DH groups 2, 5, 14-24

**Routing**:
- **Static**: Manual route entries (max 100 routes)
- **Dynamic** (BGP): Automatic route propagation (max 100 routes)

**BGP ASN**:
- VGW: 64512 (default) or custom private ASN
- CGW: Configure your ASN (private or public)

**Accelerated Site-to-Site VPN**:
- Uses Global Accelerator
- Two static IPs (anycast)
- Lower latency, better performance
- Higher cost
- Terminates at edge location (enters AWS backbone faster)

**CloudWatch Metrics**:
- TunnelState (0=down, 1=up)
- TunnelDataIn/TunnelDataOut (bytes)

**HA Design**:
- Two VPN connections (redundant CGWs)
- Two tunnels per connection (AWS provides)
- Total: 4 tunnels
- Use BGP for automatic failover

**VPN Connection + Transit Gateway**:
- Supports ECMP (aggregate bandwidth across tunnels)
- Up to 8 VPN connections × 2 tunnels = 16 tunnels = 20 Gbps theoretical

**Monitoring**:
- CloudWatch: TunnelState, TunnelDataIn/Out
- VPC Flow Logs: Traffic over VPN (via VGW ENI)

### Direct Connect

**Port Speeds**:
- **Dedicated**: 1 Gbps, 10 Gbps, 100 Gbps
- **Hosted**: 50 Mbps to 10 Gbps (sub-1G via partners)

**Virtual Interface (VIF)**:
- **Private VIF**: Access VPC (private IPs)
- **Public VIF**: Access AWS public services (S3, DynamoDB, etc.)
- **Transit VIF**: Access Transit Gateway (multi-VPC)

**Private VIF**:
- Connects to VGW or DX Gateway
- BGP required
- VLAN: 1-4094
- Advertise VPC CIDR via BGP
- Access VPC resources via private IPs
- Can attach to DX Gateway (up to 10 VGWs)

**Public VIF**:
- Access AWS public endpoints over DX (not internet)
- BGP required
- VLAN: 1-4094
- Advertise your public IPs (must own /24 or larger)
- AWS advertises public IP ranges
- Does NOT provide internet access (no default route)

**Transit VIF**:
- Connects to DX Gateway (associated with TGW)
- BGP required
- VLAN: 1-4094
- Access multiple VPCs via TGW
- Supports up to 20 TGWs per DX Gateway

**Direct Connect Gateway**:
- Global resource (not region-specific)
- Connects DX location to VPCs in any region
- Private VIF: Max 10 VGWs
- Transit VIF: Max 20 TGWs
- No transitive routing between VGWs

**LAG** (Link Aggregation Group):
- Aggregate up to 4 connections
- All connections: Same speed, same location, same bandwidth
- LACP (802.3ad)
- Active-active (ECMP)
- Minimum links: 0 (can reduce to 0 without deleting LAG)

**Resiliency Models**:

| Model | Connections | Locations | DX Routers | Customer Routers |
|-------|-------------|-----------|------------|------------------|
| Development | 1 | 1 | 1 | 1 |
| High | 2 | 1 | 2 | 2 |
| Maximum | 4 (2+2) | 2 | 4 | 4 |

**HA Best Practices**:
- Multiple connections (different routers)
- Multiple locations
- VPN backup (over internet)
- Health checks + automated failover

**MACsec Encryption**:
- Layer 2 encryption
- 10 Gbps, 100 Gbps ports only
- Requires MACsec-capable device
- Supported on dedicated connections

**VPN over DX**:
- IPsec VPN over Public VIF
- End-to-end encryption
- VPN terminates at VGW (not DX)
- Use when: Encryption required, DX alone doesn't encrypt

**SiteLink**:
- Direct connectivity between DX locations
- Bypasses AWS regions
- Charged per hour + per GB
- Use case: On-prem site A to on-prem site B via AWS backbone

**Jumbo Frames**:
- Private VIF: MTU 9001 (within same region)
- Public VIF: MTU 1500 (fixed)
- Transit VIF: MTU 8500

**CloudWatch Metrics**:
- ConnectionState
- ConnectionBpsEgress/Ingress
- ConnectionPpsEgress/Ingress
- ConnectionLightLevelTx/Rx (optical signal)

### Transit Gateway + DX

**Architecture**:
- DX -> DX Gateway (Transit VIF) -> Transit Gateway -> VPCs

**Advantages**:
- Centralized routing
- 100s of VPCs
- Transitive routing between VPCs
- Complex routing policies (multiple TGW route tables)

**Attachment**:
- DX Gateway -> TGW (up to 20 TGWs per DX Gateway)
- TGW -> DX Gateway (one DX Gateway per TGW)

---

## DNS and Route 53

### Record Types
- **A**: IPv4
- **AAAA**: IPv6
- **CNAME**: Alias (cannot be zone apex)
- **ALIAS**: AWS-specific, can be zone apex, free queries, auto-resolves to IP
- **MX**: Mail
- **TXT**: Text (SPF, DKIM, verification)
- **NS**: Name server
- **SOA**: Start of authority
- **PTR**: Reverse DNS
- **SRV**: Service
- **CAA**: Certificate authority authorization
- **DS**: DNSSEC delegation signer

### ALIAS vs CNAME

| Feature | ALIAS | CNAME |
|---------|-------|-------|
| Zone apex | Yes | No |
| AWS resources | Yes (ELB, CF, S3, etc.) | Yes (any) |
| Cost | Free | Standard query charges |
| TTL | AWS-managed | User-defined |
| Health checks | Yes | Yes |

### Routing Policies

**Simple**: Single resource or multiple IPs (random client selection)

**Weighted**: Traffic distribution by weights (0-255)
- Use: Blue-green, canary, A/B testing
- Weights: 0 = no traffic, 255 = max weight

**Latency-Based**: Route to lowest latency region
- Measured between user and AWS region
- Use: Global apps, performance optimization

**Failover**: Active-passive
- Primary and secondary
- Health check on primary
- Failover automatic

**Geolocation**: Route based on user location
- Continent, country, state (US only)
- Default location (catch-all)
- Use: Compliance, content localization

**Geoproximity**: Route based on proximity + bias
- Bias: -99 to +99 (shrink or expand region)
- Requires Traffic Flow
- Use: Shift traffic gradually between regions

**Multi-Value Answer**: Up to 8 healthy resources
- Health checks per resource
- Client-side load balancing
- Use: Simple LB without ELB

**IP-Based**: Route based on user IP ranges
- CIDR blocks -> specific resources
- Use: ISP-specific routing, compliance

### Health Checks

**Types**:
- **Endpoint**: Monitor IP/domain (HTTP/HTTPS/TCP)
- **Calculated**: Combine checks (AND/OR/NOT)
- **CloudWatch Alarm**: Based on alarm state

**Endpoint Monitoring**:
- Protocol: HTTP, HTTPS, TCP
- Interval: 30s (standard), 10s (fast)
- Failure threshold: 1-10 (default 3)
- String matching: Response body contains string
- Latency measurement: Available
- Locations: ~15 global health checkers

**Health Check States**:
- Healthy: ≥ threshold checkers report healthy
- Unhealthy: < threshold checkers report healthy

**CloudWatch Metrics**:
- HealthCheckStatus (1=healthy, 0=unhealthy)
- HealthCheckPercentageHealthy
- ConnectionTime, SSLHandshakeTime, TimeToFirstByte

### Private Hosted Zones

**Scope**: VPC-specific (not internet-accessible)

**Configuration**:
- Associate with VPCs (same or cross-account)
- Requires enableDnsHostnames + enableDnsSupport

**Split-View DNS**:
- Public hosted zone: External queries
- Private hosted zone: VPC queries (same domain)

**Cross-Account Association**:
1. Create association authorization (source account)
2. Create association (target account)
3. Delete authorization (optional)

### Route 53 Resolver

**Components**:
- **Inbound Endpoint**: On-prem -> VPC DNS
- **Outbound Endpoint**: VPC -> On-prem DNS
- **Forwarding Rules**: Which domains to forward

**Inbound Endpoint**:
- 2+ ENIs (multi-AZ HA)
- On-prem forwards queries to ENI IPs
- Resolves VPC private hosted zones + AWS resources

**Outbound Endpoint**:
- 2+ ENIs (multi-AZ HA)
- Forwarding rules specify domains
- Forwards to on-prem DNS servers

**Forwarding Rules**:
- **Forward**: Send to target IPs (on-prem DNS)
- **System**: Use default VPC DNS (.2)
- **Recursive**: Use Resolver (default)

**Rule Sharing** (RAM):
- Share rules across accounts
- Centralized DNS management

**Query Logging**:
- Log to CloudWatch Logs
- S3 (via Kinesis Firehose)
- Query name, type, response code, etc.

**DNS Firewall**:
- Block/allow DNS queries based on domain lists
- Actions: Allow, block (NODATA/NXDOMAIN/custom), alert
- Managed domain lists (malware, botnet, etc.)
- Custom domain lists

### DNSSEC

**Purpose**: Prevent DNS spoofing, cache poisoning

**Route 53 Support**:
- DNSSEC signing for public hosted zones
- DNSSEC validation for resolvers

**Configuration**:
1. Enable DNSSEC signing
2. Create KMS key (managed by Route 53)
3. Establish chain of trust (add DS record to parent zone)

**Key Signing Key (KSK)**: Signs zone-signing keys
**Zone Signing Key (ZSK)**: Signs DNS records

---

## Content Delivery and Edge

### CloudFront

**Distribution Types**:
- Web Distribution: HTTP/HTTPS/WebSocket
- RTMP Distribution: Deprecated

**Origins**:
- S3 bucket (OAC/OAI)
- ALB/NLB
- EC2
- HTTP server (on-prem, other cloud)
- MediaPackage, MediaStore
- Origin Groups (HA, failover)

**Cache Behavior**:
- Path pattern: /images/*, /api/*, etc.
- Origin selection
- Query string forwarding (all, none, whitelist)
- Cookie forwarding (all, none, whitelist)
- Header forwarding (specific headers)
- TTL (min, max, default)
- Compress objects (gzip, br)
- Viewer protocol policy (HTTP/HTTPS, redirect to HTTPS, HTTPS only)

**TTL**:
- Default: 24 hours
- Min: 0 (no cache)
- Max: 365 days
- Origin can override: Cache-Control, Expires headers

**Cache Key**:
- URL path (always included)
- Query strings (optional)
- Headers (optional)
- Cookies (optional)

**Cache Invalidation**:
- Remove objects before TTL
- Cost: First 1000 paths/month free, $0.005 per path after
- Wildcard: /images/* (counts as 1 path)
- Invalidation takes ~5 minutes

**Origin Access Control (OAC)**:
- Restrict S3 access to CloudFront only
- S3 bucket policy allows OAC principal
- Replaces OAI (legacy)
- Supports SSE-KMS, all S3 regions, PUT/DELETE

**Field-Level Encryption**:
- Encrypt sensitive fields at edge
- Public key encryption
- Only origin can decrypt (private key)
- Use case: Credit cards, PII

**Signed URLs / Signed Cookies**:
- Restrict access to paid content
- Signed URL: Single file
- Signed Cookie: Multiple files (don't change URL)
- Canned policy: Expiration only
- Custom policy: Expiration + IP + start time
- Key pairs: CloudFront key pair (root) or Trusted Key Groups (recommended)

**SSL/TLS**:
- Default: *.cloudfront.net (free)
- Custom: ACM certificate (us-east-1 only) or imported
- SNI: Free, modern browsers
- Dedicated IP: $600/month, legacy support

**Geo Restriction**:
- Whitelist/blacklist countries
- Based on IP geolocation
- Use case: Licensing, compliance

**Price Classes**:
- All Edge Locations: Best performance, highest cost
- Exclude expensive (200+ edge locations)
- North America + Europe (100+ edge locations, lowest cost)

**Real-Time Logs**:
- CloudWatch Logs, Kinesis Data Streams
- All requests (not sampled)
- Latency: Seconds
- Fields: 30+ (timestamp, IP, URI, status, etc.)

**Lambda@Edge**:
- Run code at edge locations
- Viewer request/response, origin request/response
- Use case: Personalization, auth, A/B testing, header manipulation

**CloudFront Functions**:
- Lightweight alternative to Lambda@Edge
- Viewer request/response only
- Sub-millisecond execution
- Lower cost
- Use case: Header manipulation, URL rewrites, simple auth

**Origin Shield**:
- Additional caching layer
- Between regional edge cache and origin
- Reduces load on origin
- Cost: Per GB + per 10k requests

### Global Accelerator

**Architecture**:
- 2 static anycast IPs
- Traffic enters AWS at nearest edge location
- Routed over AWS backbone to application

**Endpoints**:
- ALB, NLB
- EC2, Elastic IP
- Multiple endpoint groups (regions)

**Traffic Dials**:
- 0-100% traffic per endpoint group
- Use: Blue-green, A/B, gradual migration

**Endpoint Weights**:
- Within endpoint group
- 0-255 (like Route 53 weighted)

**Client Affinity**:
- None: No affinity
- Source IP: Same client -> same endpoint

**Health Checks**:
- Protocol: TCP, HTTP, HTTPS
- Interval: 10s or 30s
- Threshold: 1-10
- Automatic failover

**vs CloudFront**:

| Feature | CloudFront | Global Accelerator |
|---------|------------|-------------------|
| Use case | Content delivery | Global traffic management |
| Caching | Yes | No |
| Protocols | HTTP/HTTPS | TCP/UDP/HTTP/HTTPS |
| Static IPs | No | Yes (2 anycast) |
| Edge | 400+ edge locations | 100+ edge locations |
| Pricing | Data transfer + requests | Fixed fee + DT premium |

**Use Cases**:
- Non-HTTP (UDP, TCP)
- Static IPs required (whitelisting)
- Fast failover (<30s)
- Deterministic routing
- VoIP, gaming, IoT

---

## Load Balancing

### Application Load Balancer

**Layer**: 7 (HTTP/HTTPS)

**Features**:
- Path-based routing (/api/*, /images/*)
- Host-based routing (api.example.com, www.example.com)
- Header-based routing
- Query string-based routing
- HTTP method-based routing
- Source IP-based routing
- Lambda targets
- WebSocket, HTTP/2, gRPC
- IPv6
- WAF integration
- Cognito/OIDC authentication
- Sticky sessions (cookie)
- Cross-zone LB (enabled by default, no charge)

**Target Types**:
- Instance
- IP (RFC 1918, including on-prem via DX/VPN)
- Lambda

**Target Group**:
- Protocol: HTTP, HTTPS, gRPC
- Health check: HTTP, HTTPS, gRPC
- Deregistration delay: 0-3600s (default 300s)
- Slow start: 0-900s (gradually increase traffic)
- Stickiness: Duration-based (1s-7days)

**Listener Rules**:
- Conditions: Path, host, header, query, HTTP method, source IP
- Actions: Forward, redirect, fixed response, authenticate (Cognito/OIDC), weighted target groups
- Priority: 1-50000 (lower = higher priority)

**Connection Idle Timeout**: 1-4000s (default 60s)

**CloudWatch Metrics**:
- RequestCount, ActiveConnectionCount, NewConnectionCount
- TargetResponseTime, HealthyHostCount, UnHealthyHostCount
- HTTPCode_Target_2XX/3XX/4XX/5XX_Count
- HTTPCode_ELB_4XX/5XX_Count (ELB errors)
- RejectedConnectionCount

**Access Logs**:
- S3
- Fields: Timestamp, client IP, latency, request path, status code, user-agent, SSL cipher, etc.

### Network Load Balancer

**Layer**: 4 (TCP/UDP/TLS)

**Features**:
- Ultra-low latency (<100μs)
- Millions of requests/second
- Static IP per AZ (EIP supported)
- Preserves source IP
- Zonal isolation (targets in unhealthy AZ not used)
- TLS termination
- UDP, TCP, TLS
- PrivateLink support (required for VPC Endpoint Service)
- Cross-zone LB (disabled by default, charged for inter-AZ data)

**Target Types**:
- Instance
- IP (RFC 1918, on-prem via DX/VPN)
- ALB (NLB -> ALB for static IPs + L7 features)

**Target Group**:
- Protocol: TCP, UDP, TLS, TCP_UDP
- Health check: TCP, HTTP, HTTPS
- Deregistration delay: 0-3600s (default 300s)
- Connection termination on deregistration: Enabled/disabled
- Preserve client IP: Enabled (default)
- Proxy Protocol v2: Enabled/disabled (adds header with client info)

**Proxy Protocol v2**:
- Adds header: Source IP, dest IP, ports
- Use when: TLS termination at NLB + need client IP at target
- Target must parse Proxy Protocol header

**TLS Termination**:
- Certificate from ACM or imported
- Security policy: TLS 1.0-1.3, cipher suites
- SNI support (multiple certificates)

**Connection Flow**:
- Client -> NLB -> Target (direct, NLB doesn't proxy at L7)
- Target sees actual client IP

**CloudWatch Metrics**:
- ActiveFlowCount, NewFlowCount
- ProcessedBytes, ProcessedPackets
- TCP_Client_Reset_Count, TCP_Target_Reset_Count
- HealthyHostCount, UnHealthyHostCount

### Gateway Load Balancer

**Layer**: 3 (IP packets)

**Purpose**: Inline traffic inspection via 3rd-party appliances

**Characteristics**:
- GENEVE protocol (port 6081)
- Preserves 5-tuple (src IP, dst IP, src port, dst port, protocol)
- Stateless (appliances must handle state)
- Symmetric hash routing (same flow -> same appliance)

**Architecture**:
1. Traffic enters VPC
2. Route table -> GWLBE
3. GWLBE -> GWLB
4. GWLB -> Appliance (inspect/modify)
5. Appliance -> GWLB
6. GWLB -> GWLBE
7. GWLBE -> Destination

**Components**:
- Gateway Load Balancer: Load balancer for appliances
- Gateway Load Balancer Endpoint (GWLBE): VPC endpoint

**Target Types**:
- Instance
- IP

**Target Group**:
- Protocol: GENEVE
- Health check: TCP, HTTP, HTTPS

**Use Cases**:
- Firewalls (Palo Alto, Fortinet, Check Point)
- IDS/IPS
- Deep packet inspection
- Traffic analytics

### Classic Load Balancer

**Status**: Legacy (use ALB/NLB)

**Features**:
- Layer 4 (TCP) and Layer 7 (HTTP/HTTPS)
- Sticky sessions (cookie-based)
- IPv4 only

**Not Recommended**: Migrate to ALB/NLB

---

## Security

### Security Groups

**Type**: Stateful firewall (instance/ENI level)

**Characteristics**:
- Allow rules only (no deny)
- Stateful (return traffic auto-allowed)
- All rules evaluated (not first match)
- Default: Deny inbound, allow outbound
- Changes take effect immediately

**Rules**:
- Protocol: TCP, UDP, ICMP, ICMPv6, ALL
- Port range
- Source/Destination: IP, CIDR, security group ID, prefix list
- Description (optional, recommended)

**Referencing Security Groups**:
- Source = sg-xxx (dynamic membership)
- Example: DB tier allows traffic from app tier SG

**Limits**:
- 2500 SGs per VPC (soft, max 10k)
- 60 inbound + 60 outbound rules per SG (soft, max 120 each)
- 5 SGs per ENI (soft, max 16)

**Stateful Tracking**:
- Tracked by 5-tuple (src IP, dst IP, src port, dst port, protocol)
- Return traffic allowed regardless of outbound rules

**Prefix Lists**:
- Managed Prefix Lists (AWS services: S3, CloudFront, DynamoDB)
- Customer-Managed Prefix Lists (custom CIDRs)
- Use in SG/NACL rules

### Network ACLs

**Type**: Stateless firewall (subnet level)

**Characteristics**:
- Allow AND deny rules
- Stateless (must allow return traffic explicitly)
- Rules processed in order (first match wins)
- Default NACL: Allow all in/out
- Custom NACL: Deny all in/out (default)
- Changes take effect immediately

**Rules**:
- Rule number: 1-32766 (lower = higher priority)
- Protocol: TCP, UDP, ICMP, ALL
- Port range
- Source/Destination: CIDR only (no SG references)
- Allow or Deny

**Ephemeral Ports**:
- Outbound initiated: Must allow 1024-65535 inbound (return traffic)
- Inbound initiated: Must allow 1024-65535 outbound (return traffic)
- Linux: 32768-60999
- Windows: 49152-65535
- NAT Gateway: 1024-65535

**Best Practices**:
- Leave gaps between rule numbers (10, 20, 30 → easy to insert)
- Document rules
- Use NACLs for broad subnet-level controls
- Use SGs for fine-grained instance controls

**Deny Specific IP** (use case):
- NACL deny rule (SGs can't deny)
- Rule number < catch-all allow

### Security Groups vs NACLs

| Feature | Security Group | NACL |
|---------|----------------|------|
| Level | Instance (ENI) | Subnet |
| State | Stateful | Stateless |
| Rules | Allow only | Allow + Deny |
| Processing | All rules | First match wins |
| Default | Deny in, allow out | Default: Allow all; Custom: Deny all |
| Applies to | Instance launch | All instances in subnet |
| Return traffic | Auto-allowed | Must explicitly allow |

### AWS WAF

**Resources**:
- CloudFront, ALB, API Gateway, AppSync, Cognito User Pool

**Web ACL**:
- Rules (up to 1500 WCUs per ACL)
- Default action: Allow or block
- Associated with resources (max 100)

**Rule Types**:
- **Regular**: Match conditions
- **Rate-based**: Match conditions + rate limit

**Rule Statements**:
- IP set match
- Geo match
- String match (contains, exactly, starts with, ends with, regex)
- Size constraint (bytes)
- SQL injection attack
- XSS attack
- Regex pattern set
- HTTP header/body/query/URI inspection

**Actions**:
- Allow
- Block (403 Forbidden, custom response)
- Count (for testing)
- CAPTCHA

**Rate-Based Rules**:
- Threshold: 100-20,000,000 requests per 5 minutes
- Per IP
- Example: 2000 req/5min = 400 req/min

**Managed Rule Groups**:
- AWS Managed Rules (free, common threats)
- AWS Marketplace Rules (3rd party, paid)
- Custom rule groups

**AWS Managed Rules**:
- Core Rule Set (OWASP Top 10)
- Known Bad Inputs
- SQL Database
- Linux/Windows OS
- PHP/WordPress Application

**Bot Control**:
- Managed rule group
- Detect bots (good/bad)
- Actions: Allow, block, CAPTCHA

**Logging**:
- Kinesis Data Firehose (S3, Redshift, OpenSearch)
- Fields: Timestamp, action, IP, headers, URI, rule matched, etc.

**Pricing**:
- Web ACL: $5/month
- Rule: $1/month
- Requests: $0.60 per 1M
- Bot Control: $10/month + $1 per 1M requests
- CAPTCHA: $0.40 per 1000 challenges

### AWS Shield

**Shield Standard**:
- Free
- Automatic
- Layer 3/4 DDoS protection
- Always-on detection
- Protects: All AWS resources

**Shield Advanced**:
- $3000/month per organization
- Layer 3/4/7 DDoS protection
- Resources: CloudFront, Route 53, ALB, NLB, EIP, Global Accelerator
- DDoS Response Team (DRT) 24/7
- Real-time attack notifications
- DDoS cost protection (no scaling charges during attack)
- Advanced metrics (CloudWatch)
- Historical attack visibility
- WAF credits (included)

**Protected Resources (Advanced)**:
- CloudFront distributions
- Route 53 hosted zones
- Global Accelerator accelerators
- EC2 Elastic IPs
- ALB, NLB

**DDoS Response Team (DRT)**:
- 24/7 support
- Can modify SG, NACL, WAF rules on your behalf (if authorized)

### AWS Firewall Manager

**Purpose**: Centrally manage firewall rules across accounts/resources

**Requirements**:
- AWS Organizations
- Designated administrator account

**Policies**:
- WAF (ALB, CloudFront, API Gateway)
- Shield Advanced
- Security groups (VPC, EC2)
- Network Firewall
- Route 53 Resolver DNS Firewall
- Third-party firewall (Palo Alto, Fortinet)

**Policy Types**:
- **WAF**: Enforce Web ACLs
- **Shield Advanced**: Auto-protect resources
- **Security Group**: Common/audit security group
- **Network Firewall**: Firewall policy
- **DNS Firewall**: Domain lists

**Use Cases**:
- Multi-account compliance
- Centralized security management
- Automated protection for new resources

### AWS Network Firewall

**Features**:
- Stateful inspection (5-tuple + payload)
- Stateless filtering (fast, like NACL)
- Intrusion prevention (IPS)
- TLS inspection (decrypt, inspect, re-encrypt)
- Domain filtering (allow/deny FQDNs)
- URL filtering
- Protocol detection
- Suricata-compatible rules (open-source IDS/IPS)

**Components**:
- Firewall
- Firewall policy (rule groups)
- Rule groups (stateless, stateful)
- Logging (flow logs, alert logs, TLS inspection logs)

**Deployment**:
- Firewall endpoint in VPC subnet (firewall subnet)
- Route traffic through firewall endpoint
- Multi-AZ (endpoint per AZ)

**Rule Groups**:
- **Stateless**: Fast packet filtering (permit, drop, forward to stateful)
- **Stateful**: Deep inspection (5-tuple, Suricata rules, domain lists)

**Stateless Rules**:
- Match: Protocol, src/dst IP, src/dst port, TCP flags
- Actions: Pass, drop, forward to stateful
- Priority: Evaluated in order

**Stateful Rules**:
- **5-tuple**: Src/dst IP, src/dst port, protocol, direction
- **Suricata**: IDS/IPS rules (alert, pass, drop, reject)
- **Domain list**: Allow/deny FQDNs
- Actions: Pass, drop, alert

**Domain Filtering**:
- Match SNI (Server Name Indication) in TLS ClientHello
- Match HTTP Host header
- Match DNS queries (optional, requires DNS inspection)

**TLS Inspection**:
- Decrypt, inspect payload, re-encrypt
- Requires SSL/TLS certificate
- Certificate from ACM or imported
- Performance impact

**Logging**:
- **Flow logs**: 5-tuple, action, bytes, packets
- **Alert logs**: IDS/IPS alerts, matched rules
- **TLS inspection logs**: Certificate info, SNI
- Destinations: CloudWatch Logs, S3, Kinesis Firehose

**Pricing**:
- Firewall endpoint: $0.395/hour per AZ
- Data processed: $0.065/GB
- TLS inspection: Additional $0.015/GB

### VPC Traffic Mirroring

**Purpose**: Copy network traffic for analysis

**Supported**:
- Nitro-based instances only
- All protocols (TCP, UDP, ICMP, etc.)

**Components**:
- **Source**: ENI to mirror
- **Target**: ENI or NLB
- **Filter**: Traffic criteria (protocols, ports, src/dst CIDRs)
- **Session**: Source + target + filter

**Mirror Target**:
- ENI (single instance, security appliance)
- NLB (scale to multiple appliances)

**Packet Format**:
- Encapsulated in VXLAN (Virtual eXtensible LAN)
- UDP port 4789
- Original packet preserved

**Filter**:
- Accept (mirror) or reject (don't mirror)
- Protocol, src/dst port, src/dst CIDR

**Use Cases**:
- Security analysis (IDS/IPS)
- Troubleshooting
- Compliance monitoring
- Threat hunting

---

## Monitoring and Troubleshooting

### VPC Flow Logs

**Levels**:
- VPC: All ENIs in VPC
- Subnet: All ENIs in subnet
- ENI: Specific ENI

**Destinations**:
- CloudWatch Logs
- S3
- Kinesis Data Firehose

**Default Format** (version 2):
```
version account-id interface-id srcaddr dstaddr srcport dstport protocol packets bytes start end action log-status
```

**Custom Format** (version 3-5):
- Select specific fields
- Additional fields: vpc-id, subnet-id, instance-id, tcp-flags, pkt-srcaddr, pkt-dstaddr, region, az-id, sublocation-type, sublocation-id

**Actions**:
- **ACCEPT**: Allowed by SG and NACL
- **REJECT**: Blocked by SG or NACL

**Log Status**:
- OK: Logged successfully
- NODATA: No traffic during capture window
- SKIPDATA: Capture window error

**NOT Captured**:
- DHCP traffic
- AWS DNS traffic (169.254.169.254, VPC DNS server .2)
- Instance metadata (169.254.169.254)
- Amazon Time Sync Service (169.254.169.123)
- VPC router (.1)
- Reserved IPs (.0, .3, .255)
- Windows activation traffic
- Traffic to/from endpoint network interfaces

**Captured**:
- ELB (to targets)
- NAT Gateway
- VPN
- Transit Gateway

**Querying**:
- CloudWatch Logs Insights (SQL-like)
- Athena (if S3 destination)
- Sample query: Find rejected connections by source IP

**Cost**:
- CloudWatch Logs: Data ingestion + storage
- S3: Storage only (no ingestion charge)

### VPC Reachability Analyzer

**Purpose**: Static configuration analysis (no packets sent)

**How It Works**:
- Analyzes network paths between source and destination
- Checks route tables, SGs, NACLs, IGVC, VGW, TGW, peering, etc.
- Returns reachable/not reachable + blocking component

**Sources/Destinations**:
- Instance, ENI, IGW, VGW, VPC peering, TGW, VPC endpoint, Internet

**Results**:
- **Reachable**: Path exists, shows hops
- **Not Reachable**: Shows blocking component (SG, NACL, route, etc.)

**Use Cases**:
- Pre-deployment validation
- Troubleshoot connectivity
- Verify changes

**Pricing**:
- $0.10 per analysis

### CloudWatch Metrics

**NAT Gateway**:
- ActiveConnectionCount
- BytesInFromDestination/BytesOutToDestination
- BytesInFromSource/BytesOutToSource
- ConnectionAttemptCount/ConnectionEstablishedCount
- ErrorPortAllocation
- IdleTimeoutCount
- PacketsDropCount
- PacketsInFromDestination/PacketsOutToDestination
- PacketsInFromSource/PacketsOutToSource

**Transit Gateway**:
- BytesIn/BytesOut (per attachment)
- PacketsIn/PacketsOut
- BytesDropCountBlackhole/BytesDropCountNoRoute
- PacketDropCountBlackhole/PacketDropCountNoRoute

**VPN**:
- TunnelState (0=down, 1=up)
- TunnelDataIn/TunnelDataOut

**Direct Connect**:
- ConnectionState (up/down)
- ConnectionBpsEgress/ConnectionBpsIngress
- ConnectionPpsEgress/ConnectionPpsIngress
- ConnectionLightLevelTx/Rx
- ConnectionErrorCount

**VPC Endpoints**:
- BytesProcessed
- PacketsProcessed
- ActiveConnections (interface endpoints only)

### Troubleshooting Steps

**No Connectivity**:
1. Route table: Path exists? (dst CIDR -> target)
2. Security group: Inbound rule allows traffic?
3. NACL: Inbound AND outbound rules allow traffic + ephemeral ports?
4. Instance firewall (OS): iptables, Windows Firewall
5. Application: Listening on port?
6. VPC Flow Logs: ACCEPT or REJECT?
7. Reachability Analyzer: Blocking component?

**Flow Log Analysis**:
- Inbound REJECT: Check SG inbound or NACL inbound
- Outbound REJECT: Check NACL outbound (SG is stateful)
- Both directions ACCEPT but no response: App issue

**Asymmetric Routing**:
- TGW appliance mode not enabled
- Multiple paths with different return path
- Stateful appliance sees incomplete flow
- Solution: Enable appliance mode on TGW attachment

**High Latency**:
- Wrong region (use latency-based routing)
- No placement group (use cluster placement)
- Enhanced networking disabled (enable ENA)
- Small MTU (use jumbo frames)
- Cross-AZ traffic (use same AZ)

**Packet Loss**:
- NAT Gateway: ErrorPortAllocation, PacketsDropCount
- TGW: PacketDropCountBlackhole, PacketDropCountNoRoute
- Instance: Check ENI metrics, instance type limits
- VPN: Tunnel MTU mismatch

**DNS Not Resolving**:
- enableDnsHostnames + enableDnsSupport: Both must be true
- Route 53 Resolver: Inbound/outbound endpoints configured?
- Private hosted zone: Associated with VPC?
- DHCP options set: DNS server = VPC DNS server .2?
- On-prem DNS: Forwarding queries to Resolver inbound endpoint?

---

## Advanced Topics

### Network Performance

**Bandwidth Limits**:
- Instance type-specific (5 Gbps, 10 Gbps, 25 Gbps, 50 Gbps, 100 Gbps)
- Single-flow limit: 5 Gbps (c5n.18xlarge, 10 Gbps for others)
- Multi-flow: Aggregate up to instance limit
- Same AZ: Full bandwidth
- Cross-AZ: Full bandwidth (within region)
- Cross-region: Depends on route, typically lower

**Enhanced Networking**:
- ENA (Elastic Network Adapter): Up to 100 Gbps
- Intel 82599 VF: Up to 10 Gbps (legacy)
- SR-IOV (Single Root I/O Virtualization)
- Requires Nitro-based instance + ENA driver
- No additional charge

**EFA** (Elastic Fabric Adapter):
- HPC, ML workloads
- OS-bypass (lower latency, higher throughput)
- MPI (Message Passing Interface)
- Supported: P4, P3dn, C5n, C6gn, C6id
- Same AZ only (for max performance)

**Jumbo Frames**:
- MTU 9001 (default 1500)
- Within VPC: Supported
- Over internet: Not supported (1500 max)
- VPC peering: Supported
- TGW: 8500 (same AZ), 1500 (cross-AZ)
- DX Private VIF: 9001 (same region), 1500 (cross-region)
- DX Public VIF: 1500 (fixed)

**Placement Groups**:
- **Cluster**: Single AZ, low latency (10 Gbps between instances), HPC
- **Spread**: Max 7 instances per AZ, isolated failure, critical instances
- **Partition**: Groups of instances, HDFS, Cassandra, Kafka

**TCP Tuning**:
- Window scaling (RFC 1323)
- Selective ACK (SACK)
- Timestamps
- Congestion control algorithms (CUBIC, BBR)

**Network Interface Queue Length**:
- Multi-queue network adapters
- Queues = vCPUs (up to limit)

### Centralized Network Architectures

**Centralized Egress**:
- Egress VPC: NAT GW, Network Firewall, proxies
- Spoke VPCs: Route 0.0.0.0/0 -> TGW -> Egress VPC
- Benefits: Centralized control, cost optimization, logging

**Centralized Ingress** (Inspection VPC):
- Inspection VPC: Firewalls, IDS/IPS
- Internet -> IGW -> GWLBE -> GWLB -> Appliances -> Destination
- Benefits: Centralized security, DPI, threat prevention

**Shared Services VPC**:
- Central VPC: AD, DNS, monitoring, logging
- Spoke VPCs: Connect via TGW or PrivateLink
- Benefits: Centralization, reduce duplication

**Multi-Region**:
- TGW inter-region peering
- Global Accelerator for traffic management
- Route 53 for DNS failover

### IPv6 Considerations

**Address Types**:
- All IPv6 are globally unique (no private)
- Cannot use NAT for IPv6
- Egress-Only IGW for outbound-only

**VPC IPv6**:
- /56 CIDR (AWS assigns, cannot BYOIP)
- Subnet: /64 CIDR
- Free

**Enabling**:
1. Associate IPv6 CIDR with VPC
2. Associate IPv6 CIDR with subnets
3. Update route tables (::/0 -> igw or eigw)
4. Update SGs/NACLs (add IPv6 rules)
5. Assign IPv6 to instances

**Dual-Stack**:
- Both IPv4 and IPv6
- Separate address spaces
- Independent routing

**Direct Connect IPv6**:
- Supported on Private and Public VIFs
- BGP required
- Advertise IPv6 prefixes

### AWS Outposts

**Networking**:
- Local Gateway (LGW): Connects Outpost to on-prem network
- Service Link: Connects Outpost to parent AWS region
- VPC subnets extend to Outpost (Outpost subnet)

**Local Gateway Route Table**:
- Routes for on-prem connectivity
- Propagate to VPC route tables

**Connectivity**:
- Outpost to VPC: Service link (encrypted)
- Outpost to on-prem: Local Gateway

**VPC Resources on Outpost**:
- Subnets, ENIs, EBS, EC2
- Cannot use: NAT GW, VPC endpoints, NLB/ALB

### AWS Wavelength

**Purpose**: 5G edge computing (ultra-low latency)

**Networking**:
- Wavelength Zone: Extension of region, within carrier 5G network
- Carrier Gateway: Connect to carrier 5G network
- Cannot use: IGW, Egress-Only IGW, NAT GW, VPN, DX, peering

**Connectivity**:
- VPC subnet in Wavelength Zone
- Carrier Gateway for 5G
- Parent region resources via service link

**Use Cases**:
- AR/VR, real-time gaming, live video streaming
- ML inference at edge

### AWS Local Zones

**Purpose**: Low-latency compute/storage near end users

**Networking**:
- Extension of region (not separate region)
- VPC subnet in Local Zone
- Use parent region's IGW, VGW, TGW
- Direct Connect not available

**Connectivity**:
- Route to parent region
- Local Zone to internet: Via parent region IGW

### Cost Optimization

**Data Transfer Costs**:
- Within same AZ: Free (same private IP)
- Cross-AZ (same region): $0.01/GB in/out
- Cross-region: $0.02/GB (varies by region)
- To internet: $0.09/GB (first 10 TB/month)
- From internet: Free
- VPC peering (same region): $0.01/GB
- VPC peering (cross-region): $0.02/GB
- Transit Gateway: $0.02/GB processed
- NAT Gateway: $0.045/hour + $0.045/GB processed
- VPN: $0.05/hour per connection + internet DT charges
- DX: Port hours + DT out ($0.02-$0.30/GB depending on location)

**Optimization Tips**:
- Use same AZ for frequently communicating instances
- Use VPC endpoints (traffic stays on AWS network, no internet DT)
- Use CloudFront (DT from edge cheaper than region)
- Use S3 Transfer Acceleration (over internet, faster)
- Use Direct Connect for large data transfer (cheaper than internet DT)
- Disable cross-zone LB if not needed (saves inter-AZ DT)
- Use NAT instance for very low traffic (vs NAT GW)

**NAT Gateway vs NAT Instance**:
- NAT GW: $0.045/hour + $0.045/GB = $32.85/month + data
- NAT Instance (t3.nano): $0.0052/hour = $3.80/month (no data processing fee)
- Breakeven: ~600 GB/month
- NAT GW: Better performance, HA, managed
- NAT Instance: Cheaper for <600 GB/month, requires management

**VPC Endpoints**:
- Gateway endpoints (S3, DynamoDB): Free
- Interface endpoints: $0.01/hour per AZ + $0.01/GB = $7.30/month per AZ + data
- Use when: Frequent access to AWS services, avoid internet DT

---

## Exam Focus

### Key Numbers

**VPC**:
- Default VPCs: 5 per region
- CIDR blocks: 5 per VPC (1 primary + 4 secondary)
- Subnets: 200 per VPC
- Route tables: 200 per VPC
- Routes: 50 per route table (1000 max)
- Reserved IPs: 5 per subnet (.0, .1, .2, .3, .255)
- VPC peering: 125 per VPC
- Subnet CIDR: /28 to /16 (VPC inherits range)

**Transit Gateway**:
- Attachments: 5000 per TGW
- Bandwidth per VPC attachment: 50 Gbps (burst 100 Gbps)
- TGW peering: 50 per TGW
- DX Gateway: 20 TGWs per DX Gateway

**VPN**:
- Bandwidth: 1.25 Gbps per tunnel
- Tunnels: 2 per VPN connection
- BGP routes: 100 max

**Direct Connect**:
- Dedicated: 1, 10, 100 Gbps
- Hosted: 50 Mbps to 10 Gbps
- LAG: 4 connections max
- VGWs per DX Gateway: 10
- TGWs per DX Gateway: 20

**Security**:
- Security groups: 2500 per VPC (10k max)
- SG rules: 60 in + 60 out (120 max each)
- SGs per ENI: 5 (16 max)
- NACLs: 200 per VPC
- NACL rules: 20 (40 max)

**Route 53**:
- Hosted zones: 500 per account
- Records per hosted zone: 10k
- Health checks: 200 per account
- Multi-value answers: 8 max

**CloudFront**:
- Distributions: 200 per account
- Origins per distribution: 25
- Behaviors per distribution: 25
- Edge locations: 400+

**Load Balancers**:
- ALB: 1000 targets per target group
- NLB: 1000 targets per target group
- Target groups: 3000 per region

### Common Scenarios

**Q: Multiple VPCs (100+), transitive routing**
A: Transit Gateway (not VPC peering, doesn't scale)

**Q: Private S3 access, no internet, lowest cost**
A: Gateway VPC Endpoint (free, S3 only)

**Q: Private access to 100+ AWS services**
A: Interface VPC Endpoints (PrivateLink, per-service)

**Q: Share service across 50 VPCs, no peering**
A: PrivateLink (VPC Endpoint Service) with NLB

**Q: On-prem to VPC, dedicated, consistent performance**
A: Direct Connect (not VPN, internet-dependent)

**Q: DX backup, quick to provision**
A: VPN over internet

**Q: Encrypt DX traffic**
A: VPN over DX (IPsec over Public VIF) or MACsec (layer 2, 10/100 Gbps only)

**Q: Static IPs for global app, fast failover**
A: Global Accelerator (2 anycast IPs)

**Q: Block specific IP addresses**
A: NACL deny rule or WAF IP set block

**Q: Layer 7 routing (path/host)**
A: ALB

**Q: Layer 4, ultra-low latency, static IPs**
A: NLB

**Q: Inline traffic inspection (firewall, IDS/IPS)**
A: Gateway Load Balancer + GWLBE

**Q: 3rd-party firewall fleet for all VPCs**
A: GWLB in inspection VPC, GWLBE in spoke VPCs

**Q: Centralized egress for 20 VPCs**
A: Egress VPC with NAT GW/Network Firewall + TGW

**Q: Aggregate VPN bandwidth (>1.25 Gbps)**
A: ECMP with Transit Gateway (multiple VPN tunnels)

**Q: On-prem DNS to VPC, VPC to on-prem DNS**
A: Route 53 Resolver (inbound + outbound endpoints)

**Q: Multi-region HA**
A: TGW inter-region peering + Route 53 health checks

**Q: Prevent asymmetric routing through stateful firewall**
A: TGW appliance mode

**Q: VPC Flow Logs show inbound REJECT**
A: Security group inbound or NACL inbound blocking

**Q: VPC Flow Logs show outbound REJECT**
A: NACL outbound blocking (SG is stateful)

**Q: CloudFront cache content from private S3**
A: Origin Access Control (OAC), S3 bucket policy allows OAC

**Q: CloudFront restrict access to paid content**
A: Signed URLs (single file) or Signed Cookies (multiple files)

**Q: WAF block IPs exceeding 2000 req/5min**
A: Rate-based rule (threshold 2000)

**Q: Multi-account firewall management**
A: AWS Firewall Manager

**Q: Deep packet inspection in VPC**
A: AWS Network Firewall

**Q: Copy traffic for security analysis**
A: VPC Traffic Mirroring (source ENI, target ENI/NLB)

**Q: Troubleshoot connectivity without sending packets**
A: VPC Reachability Analyzer

**Q: 100 Gbps Direct Connect**
A: Dedicated connection (or 10× 10 Gbps LAG)

**Q: IPv6 outbound only, no inbound**
A: Egress-Only Internet Gateway

**Q: Dual-stack VPC**
A: IPv4 + IPv6 CIDRs, both route tables, both SG/NACL rules

**Q: Lowest latency globally**
A: Route 53 latency-based routing + Global Accelerator

**Q: Geo-restriction**
A: CloudFront geo restriction or Route 53 geolocation routing

**Q: Cost: 50 TB/month on-prem to AWS**
A: Direct Connect (DT out cheaper than internet)

**Q: Cost: 10 GB/month on-prem to AWS**
A: VPN (DX minimum cost > VPN cost)

**Q: NAT for 1 TB/month**
A: NAT Gateway ($32.85 + $45 = $77.85)

**Q: NAT for 100 GB/month**
A: NAT Instance (~$3.80, cheaper)

**Q: Preserve client IP through NLB**
A: Default behavior (NLB preserves source IP)

**Q: Preserve client IP through ALB**
A: X-Forwarded-For header (ALB adds client IP)

**Q: Static DNS name for NLB**
A: Route 53 ALIAS record

**Q: Enable cross-zone LB for NLB**
A: Manual (disabled by default, charged for inter-AZ DT)

**Q: ALB cross-zone LB**
A: Enabled by default, no charge

**Q: VPN tunnel down troubleshooting**
A: Check TunnelState metric, verify BGP, check on-prem config, VGW logs

**Q: DX connection down**
A: Check ConnectionState metric, verify LOA-CFA, check cross-connect, BGP

**Q: High NAT Gateway data processing charges**
A: Check BytesOutToDestination, consider NAT instance or VPC endpoints

**Q: TGW dropping packets**
A: PacketDropCountBlackhole (blackhole route) or PacketDropCountNoRoute (no route)

**Q: Route 53 health check failing**
A: Check endpoint reachability, SG/NACL allow health checker IPs, string match

**Q: Private hosted zone not resolving**
A: Check VPC association, enableDnsHostnames, enableDnsSupport

**Q: VPC endpoint connection refused**
A: Check endpoint service acceptance (manual approval), SG on endpoint

**Q: CloudFront 502/504 errors**
A: Origin unreachable, origin timeout, check origin SG/NACL allow CloudFront IPs

**Q: WAF blocking legitimate traffic**
A: Check Web ACL logs, rule matched, adjust rule (count mode for testing)

**Q: Shield Advanced cost protection claim**
A: Contact AWS Support, provide attack details, eligible for credit

**Q: DNSSEC validation failing**
A: Check DS record in parent zone, KSK/ZSK rotation, DNSSEC chain of trust

### Comparison Tables

**Connectivity Options**:

| Feature | VPC Peering | Transit Gateway | PrivateLink |
|---------|-------------|-----------------|-------------|
| Topology | 1:1 | Hub-spoke | Provider-consumer |
| Transitive | No | Yes | No |
| Max connections | 125 | 5000 | No limit |
| Cross-account | Yes | Yes | Yes |
| Cross-region | Yes | Yes (peering) | Yes |
| Bandwidth | No limit | 50 Gbps/VPC | Depends on NLB |
| Cost | Data transfer | Hourly + DT | Hourly + DT |
| Use case | Simple 1:1 | Complex multi-VPC | Shared services |

**Hybrid Connectivity**:

| Feature | VPN | Direct Connect | DX + VPN |
|---------|-----|----------------|----------|
| Bandwidth | 1.25 Gbps/tunnel | 1-100 Gbps | Both |
| Latency | Variable (internet) | Consistent | Consistent |
| Encrypted | Yes (IPsec) | No (or MACsec) | Yes |
| Cost | Low | High | Highest |
| Provisioning | Minutes | Weeks-months | Weeks-months |
| Use case | Quick, backup | Large data, consistent | Encrypted + performance |

**Load Balancers**:

| Feature | ALB | NLB | GWLB | CLB |
|---------|-----|-----|------|-----|
| Layer | 7 | 4 | 3 | 4/7 |
| Protocols | HTTP/HTTPS | TCP/UDP/TLS | IP | HTTP/HTTPS/TCP |
| Static IP | No | Yes | No | No |
| Latency | ms | μs | μs | ms |
| Preserve client IP | X-Forwarded-For | Yes | Yes | X-Forwarded-For |
| Targets | Instance/IP/Lambda | Instance/IP/ALB | Instance/IP | Instance |
| Use case | Microservices | Performance | Appliances | Legacy |

**VPC Endpoints**:

| Type | Gateway | Interface | GWLB Endpoint |
|------|---------|-----------|---------------|
| Services | S3, DynamoDB | 100+ AWS services | GWLB |
| Implementation | Route table | ENI | ENI |
| Cost | Free | $0.01/hr/AZ + $0.01/GB | Included in GWLB |
| Security group | No | Yes | Yes |
| On-prem access | No | Yes | Yes |
| DNS | No | Yes | No |

**DNS Routing Policies**:

| Policy | Use Case | Health Checks | Example |
|--------|----------|---------------|---------|
| Simple | Single resource | No | One web server |
| Weighted | A/B testing | Yes | 70% new, 30% old |
| Latency | Global app | Yes | Route to nearest region |
| Failover | DR | Yes | Primary + secondary |
| Geolocation | Compliance | Yes | EU users -> EU region |
| Geoproximity | Traffic shifting | Yes | Expand region A, shrink B |
| Multi-value | Simple LB | Yes | Return 8 healthy IPs |

### Study Tips

1. **Hands-on**: Create VPC, subnets, peering, TGW, VPN, DX (free tier or learn by doing)
2. **Understand WHY**: Not just what service does, but when to use it
3. **Know limits**: Soft vs hard, when to request increase
4. **Cost**: Data transfer charges (biggest factor), per-hour charges
5. **HA**: Multi-AZ, multi-region patterns
6. **Security**: Least privilege, defense in depth (SG + NACL + WAF)
7. **Troubleshooting**: Flow Logs (ACCEPT/REJECT), Reachability Analyzer
8. **BGP**: Path selection order (memorize)
9. **Route priority**: Longest prefix match, local > static > propagated
10. **Stateful vs stateless**: SG (stateful), NACL (stateless), ephemeral ports


### Final Checklist

- [ ] VPC CIDR sizing (/28 min, /16 max, 5 reserved IPs)
- [ ] Route table priority (longest prefix, local > static > propagated)
- [ ] Security groups (stateful, allow only, all rules evaluated)
- [ ] NACLs (stateless, allow+deny, first match wins, ephemeral ports)
- [ ] NAT Gateway (AZ-specific, 45 Gbps, no SG, $0.045/hr + $0.045/GB)
- [ ] VPC peering (non-transitive, no overlapping CIDRs, no edge-to-edge)
- [ ] Transit Gateway (5000 attachments, 50 Gbps/VPC, ECMP for VPN)
- [ ] VPC endpoints (gateway free, interface paid, on-prem access)
- [ ] PrivateLink (NLB + endpoint service, consumer-initiated)
- [ ] VPN (1.25 Gbps/tunnel, 2 tunnels, BGP or static)
- [ ] Direct Connect (1/10/100 Gbps dedicated, 50M-10G hosted, Private/Public/Transit VIF)
- [ ] DX Gateway (10 VGWs or 20 TGWs, global, no transitive)
- [ ] Route 53 routing policies (simple, weighted, latency, failover, geo, geoproximity, multi-value)
- [ ] Route 53 Resolver (inbound for on-prem->VPC, outbound for VPC->on-prem)
- [ ] CloudFront (OAC for S3, signed URLs/cookies, field-level encryption, Lambda@Edge)
- [ ] Global Accelerator (2 anycast IPs, TCP/UDP, no caching, fast failover)
- [ ] ALB (L7, path/host routing, Lambda targets, WebSocket, HTTP/2)
- [ ] NLB (L4, static IP, preserves source IP, ultra-low latency, TLS termination)
- [ ] GWLB (L3, GENEVE, inline inspection, appliances)
- [ ] WAF (Web ACL, rate-based rules, managed rules, IP sets, geo match, SQL injection, XSS)
- [ ] Shield (Standard free, Advanced $3k/month, DRT, cost protection)
- [ ] Firewall Manager (centralized, multi-account, Organizations required)
- [ ] Network Firewall (stateful IPS, domain filtering, TLS inspection, Suricata rules)
- [ ] VPC Flow Logs (ACCEPT/REJECT, CloudWatch/S3/Firehose, troubleshooting)
- [ ] Reachability Analyzer (static analysis, identifies blocking component)
- [ ] BGP path selection (weight > local pref > AS path > origin > MED)
- [ ] Data transfer costs (same AZ free, cross-AZ $0.01/GB, cross-region $0.02/GB, internet $0.09/GB)
- [ ] IPv6 (all public, no NAT, Egress-Only IGW, dual-stack)
- [ ] Enhanced networking (ENA 100 Gbps, EFA for HPC, SR-IOV)
- [ ] Jumbo frames (MTU 9001 within VPC, 1500 over internet)
- [ ] Placement groups (cluster for low latency, spread for HA, partition for HDFS)
- [ ] Troubleshooting (route table, SG, NACL, app, Flow Logs, Reachability Analyzer)
