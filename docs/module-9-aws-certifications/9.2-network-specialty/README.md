# AWS Certified Advanced Networking - Specialty Cheat Sheet

## 1. Network Fundamentals

### OSI Model

**Layer 7 - Application**: HTTP, HTTPS, DNS, SMTP, FTP
- ALB operates here
- WAF operates here

**Layer 6 - Presentation**: Encryption/Decryption, Compression
- SSL/TLS termination

**Layer 5 - Session**: Session management
- Not commonly referenced in AWS

**Layer 4 - Transport**: TCP, UDP
- NLB operates here
- Security Groups can filter by port
- Connection tracking happens here

**Layer 3 - Network**: IP, ICMP, Routing
- VPC routing happens here
- NACLs operate here
- Transit Gateway operates here
- NAT Gateway operates here

**Layer 2 - Data Link**: MAC addresses, Ethernet, Switches
- AWS abstracts this layer
- Elastic Network Adapter operates here

**Layer 1 - Physical**: Physical cables, signals
- Direct Connect cross-connect
- AWS manages physical infrastructure

### TCP/IP Basics

**TCP Three-Way Handshake**:
1. SYN
2. SYN-ACK
3. ACK

**Connection States**:
- ESTABLISHED: Active connection
- TIME_WAIT: Connection closing, waiting for delayed packets
- CLOSE_WAIT: Remote closed, local still open

**Port Ranges**:
- Well-known: 0-1023 (HTTP 80, HTTPS 443, SSH 22, RDP 3389)
- Registered: 1024-49151
- Ephemeral: 49152-65535 (used for client-side connections)

**Key Protocols**:
- TCP: Connection-oriented, reliable, ordered delivery
- UDP: Connectionless, fast, no guarantees (DNS, streaming, VPN)
- ICMP: Error reporting, ping, traceroute

### CIDR and Subnetting

**CIDR Notation**: IP/prefix length (10.0.0.0/16)

**Subnet Masks**:
- /32 = 255.255.255.255 = 1 IP
- /24 = 255.255.255.0 = 256 IPs
- /16 = 255.255.0.0 = 65,536 IPs
- /8 = 255.0.0.0 = 16,777,216 IPs

**Calculating Hosts**: 2^(32 - prefix) - AWS reserved IPs

**AWS Reserved IPs per Subnet** (5 total):
- .0: Network address
- .1: VPC router
- .2: DNS server
- .3: Reserved for future use
- .255: Broadcast (not used in VPC but reserved)

**Example**: 10.0.1.0/24 has 256 IPs, 251 usable (256 - 5)

**RFC 1918 Private IP Ranges**:
- 10.0.0.0/8 (10.0.0.0 - 10.255.255.255)
- 172.16.0.0/12 (172.16.0.0 - 172.31.255.255)
- 192.168.0.0/16 (192.168.0.0 - 192.168.255.255)

**Subnet Design**:
- Larger subnets = fewer subnets, more IPs per subnet
- Smaller subnets = more subnets, fewer IPs per subnet
- Cannot change subnet CIDR after creation
- Can add secondary CIDR blocks to VPC

### BGP (Border Gateway Protocol)

**Type**: Path vector routing protocol
**Port**: TCP 179

**Key Concepts**:
- AS (Autonomous System): Organization's network, identified by ASN
- ASN: 16-bit (1-65535) or 32-bit
- BGP Peers: Neighbors exchanging routes
- eBGP: Between different ASs (external)
- iBGP: Within same AS (internal)

**BGP Attributes** (for path selection):
1. **Weight**: Cisco proprietary, local to router (higher wins)
2. **Local Preference**: Preferred exit point from AS (higher wins)
3. **AS Path**: Number of ASs to destination (shorter wins)
4. **MED (Multi-Exit Discriminator)**: Influence inbound traffic (lower wins)
5. **Origin**: IGP > EGP > Incomplete

**BGP in AWS**:
- Used in Direct Connect
- Used in Site-to-Site VPN (if dynamic routing enabled)
- AWS uses ASN 7224 for VGW by default
- You configure customer ASN (public or private 64512-65534)

**Route Propagation**: Automatic advertisement of learned routes

---

## 2. VPC (Virtual Private Cloud)

### VPC Fundamentals

**Definition**: Logically isolated network in AWS cloud

**VPC Limits** (soft limits, can increase):
- 5 VPCs per region
- 200 subnets per VPC
- 200 route tables per VPC
- 50 route entries per route table (can increase to 1000)
- 5 CIDR blocks per VPC

**VPC CIDR Block**:
- Min: /28 (16 IPs)
- Max: /16 (65,536 IPs)
- Cannot overlap with existing CIDR blocks
- Can add secondary CIDR blocks (max 5 total)
- Cannot modify primary CIDR after creation

**Default VPC**:
- One per region
- CIDR: 172.31.0.0/16
- Has IGW attached by default
- Has default route (0.0.0.0/0) to IGW
- Subnets are public by default
- Instances get public IPs by default

**Tenancy**:
- Default: Shared hardware
- Dedicated: Single-tenant hardware (expensive)
- Cannot change from dedicated to default
- Can change from default to dedicated

### Subnets

**Subnet Basics**:
- Must reside in single AZ
- Cannot span multiple AZs
- CIDR must be subset of VPC CIDR
- Cannot overlap with other subnets in VPC
- Cannot resize subnet after creation

**Public Subnet**:
- Has route to Internet Gateway (0.0.0.0/0 -> IGW)
- Instances can have public IPs
- Can communicate with internet

**Private Subnet**:
- No direct route to Internet Gateway
- Uses NAT Gateway/Instance for outbound internet
- Cannot receive inbound connections from internet

**Subnet Route Table**:
- Each subnet must be associated with exactly one route table
- Route table can be associated with multiple subnets
- If not explicitly associated, uses main route table

**Auto-assign Public IP**:
- Subnet setting
- If enabled, instances launched get public IP automatically
- Public subnet should have this enabled

### Route Tables

**Main Route Table**:
- Default route table for VPC
- Automatically created with VPC
- All subnets use it unless explicitly associated with custom route table
- Best practice: Do not modify main, create custom route tables

**Custom Route Table**:
- Create for specific routing needs
- Explicitly associate with subnets

**Routes**:
- Destination: CIDR block or prefix list
- Target: Where to send traffic (IGW, NAT, VGW, TGW, VPC peer, ENI)
- Local route: VPC CIDR, cannot be deleted or modified, highest priority

**Route Priority** (most specific wins):
1. Longest prefix match (/32 wins over /24 wins over /16)
2. If equal prefix:
   - Local routes (VPC CIDR)
   - Longest prefix match in route table
   - Static routes > propagated routes
   - Direct Connect gateway > VGW > other connections

**Route Propagation**:
- VGW can propagate routes learned via VPN/Direct Connect
- Enabled per route table
- Automatically adds/removes routes as learned

**Gateway Route Table**:
- Associated with IGW or VGW
- Used for fine-grained control over traffic entering VPC
- Use case: Force traffic through security appliance

**Local Gateway Route Table**:
- For Outposts
- Routes traffic between Outpost and VPC

### Elastic Network Interface (ENI)

**Attributes**:
- Primary private IPv4 address
- One or more secondary private IPv4 addresses
- One Elastic IP per private IPv4
- One public IPv4 (if enabled)
- One or more IPv6 addresses
- Security groups
- MAC address
- Source/destination check flag

**Characteristics**:
- Bound to AZ
- Can attach/detach from instances (hot attach, warm attach, cold attach)
- Persists independently of instance lifecycle
- Can move between instances in same AZ

**Use Cases**:
- Create management network
- Network/security appliances
- Dual-homed instances with workloads on distinct subnets
- Low-budget HA solution (move ENI to standby instance)

**Source/Destination Check**:
- Enabled by default
- Instance must be source or destination of traffic
- Disable for: NAT instances, proxy servers, virtual routers

---

## 3. IP Addressing

### Public IP Addresses

**Characteristics**:
- Assigned from AWS pool
- Lost when instance stopped
- Cannot move between instances
- Free
- Assigned at launch or start

**When Assigned**:
- Subnet has auto-assign public IP enabled
- Instance launch specifically requests it

### Elastic IP (EIP)

**Characteristics**:
- Static public IPv4 address
- Allocated to account (not instance)
- Persists until explicitly released
- Can reassociate with different instances
- Bound to region
- Charged when allocated but not associated

**Limits**:
- 5 EIPs per region (soft limit)

**Use Cases**:
- Static IP needed (whitelisting, DNS)
- Move IP between instances for HA
- Mask instance/AZ failure

**Best Practice**:
- Use DNS (Route 53) instead if possible
- Use NLB for static IP with scaling

### Bring Your Own IP (BYOIP)

**Requirements**:
- ROA (Route Origin Authorization) in RPKI
- Most specific prefix: /24 for IPv4, /48 for IPv6
- Clean IP reputation
- Documented IP ownership

**Process**:
1. Create ROA in RPKI
2. Create self-signed X.509 certificate
3. Provision CIDR in AWS
4. Advertise CIDR

**Limitations**:
- Cannot share across regions
- Cannot split the CIDR

**Use Cases**:
- IP reputation matters (email servers)
- IP whitelisted by customers
- Regulatory requirements

### IPv6

**Characteristics**:
- All IPv6 addresses in AWS are public
- /56 CIDR block for VPC (AWS assigned)
- /64 CIDR block for subnet
- No NAT for IPv6 (all are internet routable)
- Free (no charge for IPv6 addresses)

**Enabling IPv6**:
- Associate IPv6 CIDR with VPC
- Associate IPv6 CIDR with subnets
- Update route tables (add ::/0 route to IGW or Egress-Only IGW)
- Update security groups/NACLs
- Configure instances to use IPv6

**Egress-Only Internet Gateway**:
- IPv6 equivalent of NAT Gateway
- Allows outbound IPv6 traffic
- Blocks inbound IPv6 traffic
- Stateful
- Use when: IPv6 instances need internet access but shouldn't be reachable from internet

**IPv6 vs IPv4**:
- IPv6 has no private ranges (all globally unique)
- No NAT for IPv6
- Must use Egress-Only IGW for outbound-only

---

## 4. Internet Connectivity

### Internet Gateway (IGW)

**Characteristics**:
- Horizontally scaled, redundant, HA
- No bandwidth constraints
- Performs NAT for instances with public IPs
- One IGW per VPC
- Must attach to VPC

**Requirements for Internet Access**:
1. IGW attached to VPC
2. Route in subnet route table (0.0.0.0/0 -> IGW)
3. Public IP or EIP on instance
4. Security group allows traffic
5. NACL allows traffic

**IPv6**:
- IGW also supports IPv6
- Route ::/0 to IGW
- No NAT for IPv6 (direct routing)

### NAT Gateway

**Purpose**: Allow private subnet instances to access internet (outbound) without being accessible from internet (inbound)

**Characteristics**:
- Managed service (AWS maintains)
- Resides in public subnet
- Requires EIP
- Bandwidth: 5 Gbps, scales to 45 Gbps
- AZ-specific (create one per AZ for HA)
- Supports TCP, UDP, ICMP
- Does NOT support port forwarding

**Configuration**:
1. Create NAT Gateway in public subnet
2. Allocate and associate EIP
3. Update private subnet route table: 0.0.0.0/0 -> NAT Gateway

**HA Design**:
- One NAT Gateway per AZ
- Each AZ's private subnets route to local NAT Gateway
- If NAT Gateway fails, only that AZ loses internet

**Pricing**:
- Hourly charge
- Data processing charge per GB

**Monitoring**:
- CloudWatch metrics: BytesInFromDestination, BytesOutToDestination, PacketsDropCount
- ConnectionAttemptCount, ConnectionEstablishedCount

### NAT Instance (Legacy)

**Characteristics**:
- EC2 instance running NAT software
- Must disable source/destination checks
- Must be in public subnet with route to IGW
- Manual HA configuration required
- Can use as bastion host
- Can use security groups

**Advantages over NAT Gateway**:
- Cheaper for low traffic
- Can use as bastion
- Port forwarding possible
- Can use multiple EIPs

**Disadvantages**:
- Single point of failure (unless HA configured)
- Bandwidth limited by instance type
- Must manage (patching, scaling)

**When to Use**:
- Cost optimization for low traffic
- Need bastion functionality
- Need port forwarding
- Need to use security groups for NAT traffic filtering

### Egress-Only Internet Gateway

**Purpose**: IPv6 outbound internet access without inbound reachability

**Characteristics**:
- IPv6 only
- Stateful (allows return traffic)
- Free
- Horizontally scaled, HA

**Configuration**:
- Create Egress-Only IGW
- Attach to VPC
- Add route: ::/0 -> Egress-Only IGW

---

## 5. VPC Connectivity

### VPC Peering

**Definition**: Network connection between two VPCs for private IP communication

**Characteristics**:
- One-to-one relationship
- Non-transitive (A peers B, B peers C, A cannot reach C)
- Cannot have overlapping CIDR blocks
- Cross-region supported (inter-region peering)
- Cross-account supported
- No single point of failure, no bandwidth bottleneck
- Traffic stays on AWS backbone (never internet)
- Encrypted in transit for inter-region

**Limitations**:
- No transitive routing
- No edge-to-edge routing (cannot access IGW, NAT, VGW, etc. in peer VPC)
- Cannot have overlapping CIDRs
- Cannot peer VPC with itself
- Maximum of 125 peering connections per VPC

**Configuration**:
1. Create peering connection (requester VPC)
2. Accept peering connection (accepter VPC)
3. Update route tables in both VPCs (destination: peer VPC CIDR, target: peering connection)
4. Update security groups/NACLs

**Use Cases**:
- Connect VPCs within same organization
- Connect VPCs across accounts
- Connect VPCs across regions

**Best Practice**:
- Use descriptive peering connection names
- For complex topologies, use Transit Gateway instead

### Transit Gateway (TGW)

**Definition**: Regional network hub connecting VPCs, on-premises networks, and remote networks

**Characteristics**:
- Transitive routing (hub-and-spoke model)
- Supports up to 5000 attachments
- Up to 50 Gbps per VPC attachment
- Centralized routing management
- Regional resource (can peer across regions)
- Supports multicast
- Inter-region peering supported

**Attachment Types**:
- VPC
- VPN
- Direct Connect Gateway
- Transit Gateway Peering
- Connect (SD-WAN integration)

**Route Tables**:
- Each attachment associated with TGW route table
- Supports multiple route tables (for isolation)
- Routes propagated or static

**Route Domains**:
- Isolate routing using multiple TGW route tables
- Use case: Separate production/development, security isolation

**Configuration**:
1. Create Transit Gateway
2. Create TGW attachments (VPC, VPN, DX Gateway)
3. Configure TGW route tables
4. Update VPC route tables (destination -> TGW)

**Use Cases**:
- Hub-and-spoke topology
- Centralized egress/ingress
- Multiple VPCs connectivity
- Hybrid connectivity (on-prem + cloud)
- Complex routing requirements

**Pricing**:
- Hourly charge per attachment
- Data processing charge per GB

**HA Considerations**:
- Automatically HA within region (multi-AZ)
- For cross-region, use TGW peering

**ECMP (Equal-Cost Multi-Path)**:
- Supported on VPN attachments
- Aggregate bandwidth across multiple tunnels

### VPC Endpoints

**Purpose**: Private connectivity to AWS services without using internet, NAT, VPN, or Direct Connect

**Types**:

**1. Gateway Endpoints**:
- Supported services: S3, DynamoDB only
- Free
- Route table target
- Regional (cannot extend out of region)
- HA, scaled automatically

**Configuration**:
1. Create gateway endpoint
2. Specify VPC
3. Select route tables to update
4. Configure endpoint policy (IAM)

**Limitations**:
- Only S3 and DynamoDB
- Cannot extend to on-premises, peered VPCs, or other regions
- Must be in same region as service

**2. Interface Endpoints (PrivateLink)**:
- Powered by PrivateLink
- Supports most AWS services and 3rd party services
- ENI with private IP in subnet
- Charged per hour + data processing
- Can access from on-premises via Direct Connect or VPN
- Can access from peered VPCs (if configured)

**Configuration**:
1. Create interface endpoint
2. Select service
3. Select VPC and subnets (creates ENI in each)
4. Select security groups
5. Enable private DNS (resolves service name to endpoint)

**Private DNS**:
- When enabled, service DNS name resolves to endpoint IP
- Example: s3.amazonaws.com resolves to endpoint instead of public IP
- Requires enableDnsHostnames and enableDnsSupport in VPC

**Endpoint Policy**:
- IAM policy controlling access through endpoint
- Does NOT replace resource policies
- Works in conjunction with IAM and resource policies

**Use Cases**:
- Access AWS services privately
- Compliance requirements (no internet)
- Reduce data transfer costs (traffic stays on AWS backbone)
- Improve security posture

### PrivateLink (VPC Endpoint Services)

**Purpose**: Expose your own services to other VPCs privately

**Architecture**:
- Service Provider: Creates Network Load Balancer + VPC Endpoint Service
- Service Consumer: Creates Interface VPC Endpoint

**Characteristics**:
- Private connectivity (no internet)
- Works across accounts and VPCs
- Consumer-initiated connection
- Provider controls access (acceptance required)
- Scales automatically
- HA (multi-AZ)

**Configuration** (Provider):
1. Create NLB in service provider VPC
2. Create VPC Endpoint Service
3. Whitelist AWS principals (accounts, IAM users/roles)
4. Accept/reject endpoint connection requests

**Configuration** (Consumer):
1. Create Interface VPC Endpoint
2. Specify service name
3. Select subnets and security groups

**Use Cases**:
- SaaS applications
- Shared services across VPCs/accounts
- Marketplace offerings
- Secure data sharing

**Pricing**:
- Hourly charge per endpoint
- Data processing charge

---

## 6. Hybrid Connectivity

### AWS Site-to-Site VPN

**Definition**: IPsec VPN connection between on-premises network and AWS VPC

**Components**:
- Virtual Private Gateway (VGW): AWS side of VPN
- Customer Gateway (CGW): On-premises side representation
- VPN Connection: The actual VPN tunnel

**Virtual Private Gateway (VGW)**:
- Attached to VPC
- One VGW per VPC
- ASN: 7224 (default) or custom
- HA across multiple AZs

**Customer Gateway (CGW)**:
- Representation of on-premises VPN device
- Specify public IP or certificate-based authentication
- ASN for BGP routing

**VPN Tunnel**:
- Two tunnels per VPN connection (HA)
- Each tunnel: 1.25 Gbps max
- IPsec
- Can use ECMP with Transit Gateway for aggregate bandwidth

**Routing**:
- Static: Manually define routes
- Dynamic: BGP route propagation (recommended)

**Configuration**:
1. Create Customer Gateway (on-prem device details)
2. Create Virtual Private Gateway
3. Attach VGW to VPC
4. Create VPN Connection
5. Download configuration file for on-prem device
6. Configure on-prem device
7. Enable route propagation in VPC route tables

**Limitations**:
- 1.25 Gbps per tunnel
- Higher latency than Direct Connect (internet-based)
- Availability depends on internet
- 50 route limit (BGP)

**Use Cases**:
- Backup for Direct Connect
- Quick hybrid connectivity
- Low data transfer requirements
- Temporary connectivity

**Pricing**:
- Hourly charge per VPN connection
- Data transfer out charges

**Accelerated Site-to-Site VPN**:
- Uses AWS Global Accelerator
- Better performance, lower latency
- Higher cost
- Use when: Global users, internet performance issues

### AWS Direct Connect (DX)

**Definition**: Dedicated private network connection from on-premises to AWS

**Characteristics**:
- Private connectivity (not internet-based)
- Consistent network performance
- Lower latency than VPN
- Bandwidth: 1 Gbps, 10 Gbps, 100 Gbps (dedicated), 50 Mbps - 10 Gbps (hosted)
- Requires physical cross-connect at DX location

**Connection Types**:

**1. Dedicated Connection**:
- Physical Ethernet port dedicated to customer
- 1 Gbps, 10 Gbps, 100 Gbps
- Ordered directly from AWS
- Lead time: weeks to months

**2. Hosted Connection**:
- Provided by APN partner
- 50 Mbps to 10 Gbps
- Faster provisioning
- More flexible bandwidth

**Virtual Interface (VIF)**:
- Logical connections over physical DX
- Types: Private VIF, Public VIF, Transit VIF

**Private VIF**:
- Connect to VPC via Virtual Private Gateway
- Access VPC resources using private IPs
- BGP required
- Can attach to Direct Connect Gateway for multi-VPC access
- VLAN tagging

**Public VIF**:
- Connect to AWS public services (S3, DynamoDB, etc.) using public IPs
- Does NOT provide internet access
- Access AWS public endpoints over DX (not internet)
- BGP required
- Must advertise public IP prefixes you own

**Transit VIF**:
- Connect to Transit Gateway
- Access multiple VPCs via TGW
- VLAN tagging
- BGP required

**Direct Connect Gateway**:
- Global resource
- Connect DX to VPCs in multiple regions
- Supports up to 10 VGWs (across regions)
- No transitive routing between VPCs

**LAG (Link Aggregation Group)**:
- Combine multiple DX connections
- Aggregate bandwidth (up to 4 connections)
- All connections must be same speed
- Active-active (LACP)

**HA Design**:
- Multiple DX connections (different devices)
- Multiple DX locations
- VPN as backup

**Resiliency Levels**:
- **Development/Test**: Single DX connection
- **High Resiliency**: Two DX connections, one location
- **Maximum Resiliency**: Two DX connections, two locations

**MACsec Encryption**:
- Layer 2 encryption
- Supported on 10 Gbps and 100 Gbps connections
- Requires MACsec-capable device

**Configuration**:
1. Create DX connection (or order from partner)
2. Download LOA-CFA (Letter of Authorization and Connecting Facility Assignment)
3. Provide LOA-CFA to colocation provider
4. Physical cross-connect established
5. Create Virtual Interface (Private, Public, or Transit)
6. Configure BGP on on-prem device
7. Update VPC route tables (if using Private VIF)

**Use Cases**:
- Large data transfers (avoid internet bandwidth costs)
- Hybrid cloud architecture
- Consistent network performance required
- Latency-sensitive applications
- Compliance (private connectivity required)

**Pricing**:
- Port hours (hourly charge)
- Data transfer out (per GB)
- No charge for data transfer in

**Limitations**:
- Not encrypted by default (use VPN over DX or MACsec)
- Single point of failure if not designed for HA
- Lead time for provisioning
- Requires physical presence at DX location

**VPN over Direct Connect**:
- IPsec VPN over Public VIF
- End-to-end encryption
- Combines DX performance with VPN security
- Use when: Encryption required

**SiteLink**:
- Direct connectivity between DX locations
- Bypass AWS regions
- Use case: On-prem to on-prem via AWS backbone

### Transit Gateway with Direct Connect

**Architecture**:
- DX -> Direct Connect Gateway -> Transit Gateway -> Multiple VPCs

**Advantages**:
- Centralized routing
- Scale to hundreds of VPCs
- Transitive routing
- Simplifies on-premises to multi-VPC connectivity

**Configuration**:
1. Create Transit Gateway
2. Create Transit VIF on DX
3. Create Direct Connect Gateway
4. Associate DX Gateway with Transit Gateway
5. Attach VPCs to Transit Gateway

### AWS Cloud WAN

**Definition**: Managed WAN service for global network connectivity

**Capabilities**:
- Central dashboard for global network
- Connects VPCs, on-premises, branch offices
- Built on Transit Gateway and DX
- Network segmentation
- Automated routing

**Use Cases**:
- Large-scale global networks
- Multi-region, multi-account
- SD-WAN integration

---

## 7. DNS and Route 53

### Route 53 Basics

**Record Types**:
- **A**: IPv4 address
- **AAAA**: IPv6 address
- **CNAME**: Canonical name (alias to another domain)
- **MX**: Mail exchange
- **TXT**: Text records (SPF, DKIM)
- **NS**: Name server
- **SOA**: Start of authority
- **PTR**: Reverse DNS lookup
- **SRV**: Service locator
- **CAA**: Certificate authority authorization
- **ALIAS**: AWS-specific, alias to AWS resources

**ALIAS vs CNAME**:
- ALIAS: AWS proprietary, can point to AWS resources (ELB, CloudFront, S3), free queries, can be zone apex
- CNAME: Standard, cannot be zone apex, charged for queries

**TTL (Time To Live)**:
- How long DNS resolvers cache record
- Lower TTL = more queries, faster updates
- Higher TTL = fewer queries, slower updates, lower cost

### Routing Policies

**Simple Routing**:
- Single resource
- No health checks
- Multiple IPs returned in random order (client chooses)

**Weighted Routing**:
- Distribute traffic across resources based on weights
- Weight: 0-255
- Use case: A/B testing, gradual migration, blue-green deployments
- Supports health checks

**Latency-Based Routing**:
- Route to resource with lowest latency
- Based on latency between user and AWS region
- Use case: Global applications, performance optimization
- Supports health checks

**Failover Routing**:
- Active-passive setup
- Primary and secondary resources
- Health check on primary, fails over to secondary if unhealthy
- Use case: Disaster recovery, HA

**Geolocation Routing**:
- Route based on user's geographic location
- Can specify continent, country, or state (US only)
- Default location if no match
- Use case: Content localization, compliance, restrict content distribution
- Supports health checks

**Geoproximity Routing**:
- Route based on geographic location of users and resources
- Bias: Expand or shrink geographic region
- Use case: Shift traffic from one region to another
- Requires Route 53 Traffic Flow

**Multi-Value Answer Routing**:
- Return multiple healthy resources (up to 8)
- Client-side load balancing
- Health checks per resource
- Use case: Simple load balancing, multi-target responses

### Health Checks

**Types**:
- **Endpoint**: Monitor endpoint (IP or domain)
- **Calculated**: Combine multiple health checks (AND, OR, NOT)
- **CloudWatch Alarm**: Based on CloudWatch alarm state

**Endpoint Health Check**:
- Protocol: HTTP, HTTPS, TCP
- Interval: 30 seconds (standard), 10 seconds (fast)
- Failure threshold: Number of consecutive failures (default 3)
- String matching: Check response body for specific string
- Latency measurement available

**Health Check Behavior**:
- Healthy: Passes threshold
- Unhealthy: Fails threshold
- Health checkers: ~15 locations globally

**Use Cases**:
- Failover routing
- Weighted routing (exclude unhealthy)
- Multi-value answer (return only healthy)

**Pricing**:
- Monthly charge per health check
- Optional features (string matching, latency, fast interval) cost more

### Private Hosted Zones

**Purpose**: DNS for private VPC resources

**Characteristics**:
- VPC-specific
- Not accessible from internet
- Can associate with multiple VPCs (including cross-account)
- Supports all Route 53 routing policies

**Requirements**:
- VPC must have enableDnsHostnames and enableDnsSupport enabled

**Split-View DNS**:
- Public hosted zone: External users
- Private hosted zone: Internal users (VPC)
- Same domain name, different records

**Use Cases**:
- Internal application DNS
- Hybrid cloud (use with Resolver)

### Route 53 Resolver

**Purpose**: Resolve DNS queries between VPCs and on-premises networks

**Components**:

**Inbound Endpoint**:
- On-premises can resolve VPC DNS
- ENIs in VPC
- On-prem forwards queries to endpoint IPs

**Outbound Endpoint**:
- VPC can resolve on-premises DNS
- ENIs in VPC
- Forwarding rules specify which domains to forward

**Resolver Rules**:
- Forward: Forward queries for specific domain to on-prem DNS
- System: Use default VPC DNS resolution
- Recursive: Not commonly used

**Configuration**:
1. Create Resolver inbound/outbound endpoints
2. Create forwarding rules (for outbound)
3. Associate rules with VPCs
4. Configure on-prem DNS to forward queries to inbound endpoint IPs

**Use Cases**:
- Hybrid DNS resolution
- Centralized DNS management
- Access VPC resources from on-premises using DNS names

**Pricing**:
- Hourly charge per endpoint (per ENI)
- Queries processed charge

### DNSSEC

**Purpose**: Protect against DNS spoofing and cache poisoning

**Support**:
- Route 53 supports DNSSEC signing
- Supports DNSSEC validation

**Configuration**:
- Enable DNSSEC signing on hosted zone
- Create KMS key (Route 53 uses KMS)
- Establish chain of trust with parent zone

---

## 8. Content Delivery and Edge

### CloudFront

**Definition**: Global CDN (Content Delivery Network)

**Key Concepts**:

**Distribution**:
- Web Distribution: Static/dynamic content, live streaming
- RTMP Distribution: Deprecated

**Origin**:
- Source of content
- Types: S3, Custom HTTP(S) server, MediaPackage, MediaStore
- Multiple origins per distribution (origin groups for HA)

**Edge Location**:
- Worldwide data centers caching content
- 400+ edge locations

**Regional Edge Cache**:
- Intermediate cache between origin and edge locations
- Larger cache than edge locations
- Reduces load on origin

**Behaviors**:
- Path patterns to route to different origins
- Example: /images/* to S3, /api/* to ALB
- Controls caching, headers, query strings, cookies

**TTL**:
- Default: 24 hours
- Min/Max configurable
- Origin can set via Cache-Control, Expires headers

**Cache Invalidation**:
- Remove objects before TTL expires
- Charged per invalidation request
- Wildcard patterns supported (/images/*)

**Signed URLs / Signed Cookies**:
- Restrict content access
- Signed URL: Single file
- Signed Cookie: Multiple files, current URL shouldn't change
- Requires CloudFront key pair (from root account or trusted key group)

**Origin Access Control (OAC)** / Origin Access Identity (OAI):
- Restrict S3 bucket access to CloudFront only
- S3 bucket policy allows OAC/OAI
- OAC: Newer, supports SSE-KMS, all S3 regions, PUT/DELETE
- OAI: Legacy

**Field-Level Encryption**:
- Encrypt sensitive data at edge
- Only specific applications can decrypt
- Use case: Credit cards, personal data

**Geo Restriction**:
- Whitelist or blacklist countries
- Use case: Content licensing, compliance

**SSL/TLS**:
- Default CloudFront certificate (*.cloudfront.net)
- Custom SSL certificate (ACM or imported)
- SNI (Server Name Indication): Free, modern browsers
- Dedicated IP: Expensive, legacy support

**Price Classes**:
- All Edge Locations: Best performance, highest cost
- Exclude Most Expensive: Reduce cost, exclude expensive regions
- Only North America and Europe: Lowest cost

**Use Cases**:
- Static content delivery (images, CSS, JS)
- Video streaming (live, on-demand)
- API acceleration
- Dynamic content (with caching for common requests)

**Integration with AWS Shield**:
- Standard Shield: Automatic, free, DDoS protection
- Advanced Shield: Paid, advanced DDoS protection, 24/7 DRT support

**Integration with WAF**:
- Filter requests based on rules
- Protect against common web exploits

### AWS Global Accelerator

**Definition**: Network service using AWS global network to improve availability and performance

**How It Works**:
- Provides 2 static anycast IPs
- Traffic enters AWS network at nearest edge location
- Routed over AWS private backbone to application
- Health checks and automatic failover

**Use Cases**:
- Global applications requiring static IPs
- Fast regional failover
- Deterministic routing
- UDP applications (not supported by CloudFront)

**vs CloudFront**:
- CloudFront: Caching, HTTP/HTTPS only, edge locations serve content
- Global Accelerator: No caching, TCP/UDP, proxies packets to applications, static IPs

**Endpoints**:
- NLB, ALB, EC2 instances, Elastic IPs

**Traffic Dials**:
- Control traffic percentage to endpoint groups
- Use case: Blue-green deployment, A/B testing

**Endpoint Weights**:
- Distribute traffic within endpoint group

**Client Affinity**:
- Route same client to same endpoint
- Based on source IP
- None or Source IP

**Pricing**:
- Fixed hourly fee
- Data transfer premium (over standard AWS data transfer)

---

## 9. Load Balancing

### Application Load Balancer (ALB)

**Layer**: Layer 7 (Application)

**Characteristics**:
- HTTP, HTTPS, gRPC
- Path-based routing (/images, /api)
- Host-based routing (subdomain.example.com)
- Query string/header routing
- WebSocket support
- HTTP/2 support
- Native IPv6 support
- Integration with AWS services (ECS, EKS, Lambda, ACM, Cognito, WAF)

**Target Types**:
- Instance IDs
- IP addresses (private IPs, RFC 1918)
- Lambda functions

**Target Groups**:
- Grouping of targets
- Health checks per target group
- Routing rules direct traffic to target groups

**Listener**:
- Port and protocol to listen on
- Rules to route requests

**Listener Rules**:
- Conditions: Path, host, header, query string, source IP
- Actions: Forward, redirect, fixed response, authenticate (Cognito, OIDC)
- Priority (1-50000)

**Sticky Sessions** (Session Affinity):
- Route requests from same client to same target
- Cookie-based
- Duration-based or application-controlled

**Cross-Zone Load Balancing**:
- Enabled by default
- Distributes traffic evenly across all targets in all AZs

**Security**:
- Security groups control traffic to ALB
- ALB can terminate SSL/TLS (requires certificate in ACM)
- SNI support (multiple SSL certificates)

**Use Cases**:
- Microservices, container-based applications
- Lambda invocation
- Path/host-based routing
- User authentication

**Pricing**:
- Hourly charge
- LCU (Load Balancer Capacity Unit) charge

**Monitoring**:
- CloudWatch metrics (RequestCount, TargetResponseTime, HTTPCode_*)
- Access logs to S3

### Network Load Balancer (NLB)

**Layer**: Layer 4 (Transport)

**Characteristics**:
- TCP, UDP, TLS
- Ultra-high performance (millions of requests per second)
- Low latency
- Static IP per AZ (Elastic IP supported)
- Preserves source IP
- Zonal isolation (targets in unhealthy AZ not used)

**Target Types**:
- Instance IDs
- IP addresses (private IPs, RFC 1918, on-premises via DX/VPN)
- ALB (NLB -> ALB for static IPs + ALB features)

**Health Checks**:
- TCP, HTTP, HTTPS
- Active and passive health checks

**Cross-Zone Load Balancing**:
- Disabled by default
- Charged for inter-AZ data transfer if enabled

**TLS Termination**:
- Supported
- Certificate from ACM
- Security policies (TLS versions, ciphers)

**Preserve Source IP**:
- Yes, by default (unlike ALB)
- Client IP visible to targets

**Proxy Protocol**:
- Optional
- Adds header with connection information
- Use when: Targets need client connection details and using TLS termination

**Use Cases**:
- High-performance applications
- Static IPs required
- TCP/UDP traffic
- PrivateLink (NLB required for VPC Endpoint Services)
- Low latency critical

**Pricing**:
- Hourly charge
- NLCU (NLB Capacity Unit) charge

### Classic Load Balancer (CLB)

**Status**: Legacy (AWS recommends ALB or NLB)

**Layer**: Layer 4 and 7

**Characteristics**:
- HTTP, HTTPS, TCP, SSL
- Sticky sessions
- Basic routing

**Not Recommended**: Use ALB or NLB for new applications

### Gateway Load Balancer (GWLB)

**Layer**: Layer 3 (Network)

**Purpose**: Deploy, scale, and manage 3rd party virtual appliances (firewalls, IDS/IPS, DPI)

**Characteristics**:
- Transparent network gateway + load balancer
- GENEVE protocol (port 6081)
- Single entry/exit point for traffic
- Scales appliances

**Architecture**:
1. Traffic enters VPC
2. GWLB routes to virtual appliances
3. Appliances process traffic (inspect, filter, modify)
4. GWLB routes back to destination

**Use Cases**:
- Firewalls (Palo Alto, Fortinet, Check Point)
- IDS/IPS
- Deep packet inspection
- Centralized security appliance fleet

**Components**:
- Gateway Load Balancer
- Gateway Load Balancer Endpoint (GWLBE): VPC Endpoint for GWLB

**Integration**:
- Ingress routing: Route table points to GWLBE
- Traffic mirrored to appliances

---

## 10. Security

### Security Groups

**Type**: Stateful firewall at instance level

**Characteristics**:
- Rules for inbound and outbound traffic
- Allow rules only (no deny)
- Stateful: Return traffic automatically allowed
- Evaluated before NACLs
- Applied at ENI level
- Default: All outbound allowed, all inbound denied

**Rule Components**:
- Type/Protocol: TCP, UDP, ICMP, or ALL
- Port range
- Source (inbound) or Destination (outbound): IP, CIDR, security group ID, prefix list

**Referencing Security Groups**:
- Can reference another security group as source/destination
- Use case: Allow traffic from instances in specific security group
- Dynamic membership (instances added/removed automatically)

**Limits**:
- 2500 security groups per VPC
- 60 inbound rules + 60 outbound rules per security group
- 5 security groups per ENI

**Best Practices**:
- Least privilege
- Separate security groups by tier (web, app, db)
- Use security group references instead of IPs when possible
- Document rules

**Use Cases**:
- Instance-level firewall
- Fine-grained access control
- Dynamic membership management

### Network ACLs (NACLs)

**Type**: Stateless firewall at subnet level

**Characteristics**:
- Rules for inbound and outbound traffic
- Allow and deny rules
- Stateless: Must explicitly allow return traffic
- Evaluated after security groups (if entering instance)
- Rules numbered 1-32766, processed in order
- Default NACL: Allows all inbound and outbound
- Custom NACL: Denies all inbound and outbound by default

**Rule Components**:
- Rule number (lower processed first)
- Type/Protocol
- Port range
- Source (inbound) or Destination (outbound): CIDR only
- Allow or Deny

**Rule Evaluation**:
- Rules processed in order (lowest to highest)
- First match wins
- If no match, default rule applies (deny all)

**Ephemeral Ports**:
- Must allow ephemeral ports (1024-65535) for return traffic
- Client initiates on random ephemeral port

**Use Cases**:
- Subnet-level security
- Block specific IPs (deny rules)
- Additional layer of defense

**Best Practices**:
- Leave space between rule numbers (10, 20, 30) for future insertions
- Use NACLs for broad subnet-level rules
- Use security groups for instance-specific rules

**Security Groups vs NACLs**:
| Feature | Security Group | NACL |
|---------|----------------|------|
| Level | Instance (ENI) | Subnet |
| State | Stateful | Stateless |
| Rules | Allow only | Allow and Deny |
| Rule Processing | All rules evaluated | First match wins |
| Default | Deny inbound, allow outbound | Default: Allow all; Custom: Deny all |

### AWS WAF (Web Application Firewall)

**Definition**: Protect web applications from common exploits

**Supported Resources**:
- CloudFront
- ALB
- API Gateway
- AppSync

**Web ACL** (Access Control List):
- Rules to allow/block requests
- Up to 10 rules per Web ACL

**Rule Types**:

**1. Managed Rules**:
- AWS Managed Rules (free, common threats)
- AWS Marketplace Rules (3rd party)

**2. Custom Rules**:
- Conditions: IP sets, geo match, size constraints, SQL injection, XSS, string/regex matching
- Actions: Allow, Block, Count
- Rate-based rules (DDoS protection)

**Rule Actions**:
- Allow: Forward request
- Block: Return 403 Forbidden
- Count: Count matching requests (testing)

**Rate-Based Rules**:
- Block IPs exceeding request threshold
- 5-minute rolling window
- Use case: DDoS mitigation, brute force protection

**Pricing**:
- Monthly charge per Web ACL
- Monthly charge per rule
- Per million requests

**Use Cases**:
- OWASP Top 10 protection
- Rate limiting
- Geo-blocking
- IP blocking

### AWS Shield

**Purpose**: DDoS protection

**Shield Standard**:
- Free
- Automatic protection
- Layer 3/4 DDoS protection
- Protects all AWS customers

**Shield Advanced**:
- $3000/month per organization
- Enhanced DDoS protection
- Layer 3/4/7 protection
- Real-time attack notifications
- DDoS Response Team (DRT) 24/7
- DDoS cost protection (no scaling charges during attack)
- Protected resources: CloudFront, Route 53, ALB, NLB, EIP, Global Accelerator

**Use Cases**:
- High-profile applications
- Cannot tolerate DDoS
- Large-scale attacks expected

### AWS Firewall Manager

**Purpose**: Centrally configure and manage firewall rules across accounts and applications

**Supported**:
- WAF rules (CloudFront, ALB, API Gateway)
- Shield Advanced protections
- Security groups (VPC)
- Network Firewall rules
- Route 53 Resolver DNS Firewall

**Requirements**:
- AWS Organizations
- Designated Firewall Manager administrator account

**Policies**:
- WAF policy
- Shield Advanced policy
- Security group policy
- Network Firewall policy

**Use Cases**:
- Multi-account security management
- Centralized compliance enforcement
- Consistent security posture

### AWS Network Firewall

**Purpose**: Managed firewall for VPC

**Features**:
- Stateful inspection
- Intrusion prevention (IPS)
- Deep packet inspection
- URL/domain filtering
- Suricata-compatible rules

**Deployment**:
- Deployed in VPC subnet (firewall subnet)
- Routes traffic through firewall
- Multi-AZ HA

**Rule Groups**:
- Stateless: Fast packet filtering (like NACL)
- Stateful: Connection tracking, deep inspection

**Use Cases**:
- Advanced threat protection
- Outbound filtering (block malicious domains)
- Centralized egress VPC
- Compliance requirements (IPS, DPI)

**Pricing**:
- Hourly charge per firewall endpoint
- Data processing charge

### VPC Traffic Mirroring

**Purpose**: Copy network traffic for analysis

**Architecture**:
- Source: ENI to mirror
- Target: ENI or NLB
- Filter: Define what traffic to mirror

**Use Cases**:
- Security analysis
- Troubleshooting
- Compliance monitoring

**Configuration**:
1. Create mirror target (ENI or NLB)
2. Create mirror filter (traffic criteria)
3. Create mirror session (source, target, filter)

**Supported Instances**:
- Nitro-based instances only

---

## 11. Monitoring and Troubleshooting

### VPC Flow Logs

**Purpose**: Capture IP traffic information for network interfaces

**Levels**:
- VPC: All ENIs in VPC
- Subnet: All ENIs in subnet
- ENI: Specific ENI

**Destinations**:
- CloudWatch Logs
- S3
- Kinesis Data Firehose

**Information Captured**:
- Source/Destination IPs
- Source/Destination Ports
- Protocol
- Packets
- Bytes
- Action (ACCEPT, REJECT)
- Log status

**Format**:
- Default format (14 fields)
- Custom format (select specific fields)

**Limitations**:
- Does NOT capture:
  - DHCP traffic
  - AWS DNS traffic (VPC DNS server .2)
  - Instance metadata (169.254.169.254)
  - Amazon Time Sync Service
  - Windows license activation
  - Traffic to/from VPC router (.1)
- Captures traffic to/from ELB, NAT Gateway, etc.

**Use Cases**:
- Troubleshooting connectivity issues
- Security analysis (detect anomalies)
- Network forensics
- Compliance

**Querying**:
- CloudWatch Logs Insights
- Athena (if stored in S3)

**Example Scenarios**:
- Inbound rejected: Check security group and NACL inbound rules
- Outbound rejected: Check NACL outbound rules (if stateful like security group, return traffic auto-allowed)

### VPC Reachability Analyzer

**Purpose**: Network diagnostics tool to analyze and debug reachability between resources

**How It Works**:
- Creates path analysis (source to destination)
- Does NOT send packets (static configuration analysis)
- Identifies misconfigurations

**Supported Resources**:
- Instances, IGW, VGW, VPC peering, TGW, NLB, VPC endpoints

**Results**:
- Reachable: Path exists
- Not Reachable: Identifies blocking component (security group, NACL, route table, etc.)

**Use Cases**:
- Validate connectivity before deployment
- Troubleshoot connectivity issues
- Verify network changes

**Pricing**:
- Per analysis

### CloudWatch Metrics

**Default EC2 Metrics** (provided without CloudWatch agent):
- CPUUtilization
- DiskReadOps, DiskWriteOps
- NetworkIn, NetworkOut
- StatusCheckFailed

**Enhanced Monitoring** (CloudWatch agent required):
- Memory utilization
- Disk space utilization
- Detailed per-process metrics

**Network-Specific Metrics**:

**VPC NAT Gateway**:
- BytesInFromSource, BytesOutToDestination
- PacketsInFromSource, PacketsOutToDestination
- ConnectionAttemptCount, ConnectionEstablishedCount
- ErrorPortAllocation

**VPN**:
- TunnelState (0=down, 1=up)
- TunnelDataIn, TunnelDataOut

**Transit Gateway**:
- BytesIn, BytesOut
- PacketsIn, PacketsOut
- PacketDropCountBlackhole, PacketDropCountNoRoute

**Direct Connect**:
- ConnectionState
- ConnectionBpsEgress, ConnectionBpsIngress
- ConnectionPpsEgress, ConnectionPpsIngress

**Load Balancers**:
- ActiveConnectionCount, NewConnectionCount
- ProcessedBytes, TargetResponseTime
- HealthyHostCount, UnHealthyHostCount
- HTTPCode_Target_2XX_Count, HTTPCode_Target_4XX_Count

### CloudWatch Alarms

**Purpose**: Alert on metric thresholds

**States**:
- OK: Metric within threshold
- ALARM: Metric breached threshold
- INSUFFICIENT_DATA: Not enough data

**Actions**:
- SNS notification
- Auto Scaling action
- EC2 action (stop, terminate, reboot, recover)
- Systems Manager action

**Use Cases**:
- High network utilization alert
- VPN tunnel down alert
- Unhealthy target alert

### AWS CloudTrail

**Purpose**: Log AWS API calls for auditing

**Events**:
- Management events: Control plane operations (CreateVPC, DeleteSubnet)
- Data events: Data plane operations (S3 object-level, Lambda invocations)
- Insights events: Unusual activity detection

**Use Cases**:
- Security analysis (who did what)
- Compliance auditing
- Troubleshooting (track changes)
- Operational troubleshooting

**Integration**:
- CloudWatch Logs (for searching)
- S3 (for long-term storage)
- Athena (for querying)

**Network-Specific Use Cases**:
- Track security group changes
- Track route table changes
- Track VPC creation/deletion

### AWS Config

**Purpose**: Track resource configuration and compliance

**Config Rules**:
- AWS Managed Rules
- Custom Rules (Lambda)

**Network-Specific Rules**:
- vpc-flow-logs-enabled
- vpc-sg-open-only-to-authorized-ports
- restricted-ssh (SG not open to 0.0.0.0/0 on port 22)
- restricted-common-ports

**Use Cases**:
- Compliance checking
- Configuration drift detection
- Audit trail of configuration changes

### Network Access Analyzer

**Purpose**: Identify unintended network access

**How It Works**:
- Creates network access scope
- Analyzes network paths
- Identifies resources accessible from internet or untrusted networks

**Use Cases**:
- Security auditing
- Verify least privilege
- Compliance verification

---

## 12. Automation and Infrastructure as Code

### AWS CloudFormation

**Purpose**: Provision AWS resources using templates

**Templates**:
- JSON or YAML
- Resources: AWS resources to create
- Parameters: Input values
- Mappings: Key-value pairs
- Conditions: Conditional resource creation
- Outputs: Values to export

**Network Resources**:
- VPC, Subnets, Route Tables
- Internet Gateway, NAT Gateway, VGW
- Security Groups, NACLs
- VPC Peering, Transit Gateway
- VPN, Direct Connect

**Best Practices**:
- Use nested stacks for modularity
- Use cross-stack references (Exports/Imports)
- Use parameters for flexibility
- Use version control

**StackSets**:
- Deploy stacks across multiple accounts and regions
- Use case: Multi-account network setup

### AWS CDK (Cloud Development Kit)

**Purpose**: Define infrastructure using programming languages

**Supported Languages**:
- TypeScript, JavaScript, Python, Java, C#, Go

**Benefits**:
- Familiar programming constructs (loops, conditionals)
- Reusable components (constructs)
- Synthesizes to CloudFormation

### AWS Systems Manager

**Session Manager**:
- Access instances without SSH/RDP
- No bastion host required
- No open inbound ports
- Auditable (CloudTrail logs)

**Use Case**:
- Secure instance access in private subnets

**Requirements**:
- SSM agent on instance
- IAM role for instance
- VPC endpoint for SSM (if no internet access)

### AWS Lambda for Network Automation

**Use Cases**:
- Automated security group updates
- VPC flow log analysis
- Respond to network events (CloudWatch Events)
- Custom monitoring and alerting

**Example**:
- Lambda triggered by CloudWatch Event (new instance launched)
- Lambda adds instance to security group

### AWS Service Catalog

**Purpose**: Manage approved infrastructure templates

**Use Case**:
- Standardized network architectures
- Self-service provisioning with governance

### Terraform

**Third-party tool**: Infrastructure as Code

**AWS Provider**: Supports all AWS networking resources

**Benefits**:
- Multi-cloud support
- State management
- Plan/apply workflow

---

## 13. Advanced Topics

### IPv6 in AWS

**Dual-Stack VPCs**:
- Both IPv4 and IPv6
- Separate CIDRs
- Independent routing

**IPv6 Considerations**:
- All IPv6 addresses are public
- No NAT for IPv6 (use Egress-Only IGW for outbound-only)
- Security groups and NACLs support IPv6
- Route tables need ::/0 routes
- Direct Connect supports IPv6

**Migration Strategy**:
1. Add IPv6 CIDR to VPC
2. Update subnets
3. Update route tables
4. Update security groups/NACLs
5. Assign IPv6 to instances
6. Test

### Multi-Region Architectures

**Cross-Region VPC Peering**:
- Encrypted
- Uses AWS backbone
- No bandwidth bottleneck

**Transit Gateway Inter-Region Peering**:
- Connect Transit Gateways across regions
- Encrypted
- Transitive routing within each region

**Global Accelerator**:
- Static anycast IPs
- Global routing
- Fast failover

**Route 53**:
- Latency-based routing
- Geolocation routing
- Health checks for failover

**Design Patterns**:
- Active-Active: Traffic distributed across regions
- Active-Passive: Primary region, failover to secondary
- Active-Active-Passive: Multiple active, one passive for DR

### Centralized Egress VPC

**Architecture**:
- Dedicated VPC for internet egress
- All outbound internet traffic routed through it
- NAT Gateways, proxies, firewalls in egress VPC
- Spoke VPCs route to egress VPC via Transit Gateway

**Benefits**:
- Centralized security controls
- Centralized logging
- Cost optimization (fewer NAT Gateways)
- Simplified compliance

**Implementation**:
1. Create egress VPC with NAT Gateways/Network Firewall
2. Connect spoke VPCs to Transit Gateway
3. Configure TGW route tables (spoke VPCs route internet traffic to egress VPC)
4. Configure egress VPC route tables

### Centralized Ingress (Inspection VPC)

**Architecture**:
- Dedicated VPC for inbound traffic inspection
- Firewalls, IDS/IPS in inspection VPC
- Traffic from internet routed through inspection VPC

**Use Case**:
- Security appliances
- Deep packet inspection
- Threat detection

### AWS Outposts

**Networking**:
- Local Gateway: Connects Outpost to on-premises
- Service Link: Connects Outpost to AWS region
- VPC extends to Outpost (Outpost subnets)
- Local Gateway Route Tables

**Connectivity**:
- Outpost to VPC: Service link
- Outpost to on-premises: Local Gateway

### AWS Wavelength

**Purpose**: 5G edge computing

**Networking**:
- Wavelength Zone: Extension of region
- Carrier Gateway: Connect to 5G network
- VPC subnet in Wavelength Zone

**Use Cases**:
- Ultra-low latency applications
- Mobile edge computing
- Real-time gaming, AR/VR

### AWS Local Zones

**Purpose**: Place compute, storage closer to end users

**Networking**:
- Extension of region
- VPC subnet in Local Zone
- Use parent region's IGW, VGW, TGW

**Use Cases**:
- Low-latency applications
- Local data processing

### PrivateLink Multi-Account Patterns

**Shared Services VPC**:
- Central VPC hosts services
- Expose via PrivateLink
- Consumer VPCs create interface endpoints

**Benefits**:
- No VPC peering needed
- Consumer-initiated connection
- Private connectivity
- Scales to hundreds of VPCs

### Network Performance Optimization

**Placement Groups**:
- **Cluster**: Low latency, high throughput (single AZ)
- **Spread**: Max 7 instances per AZ, isolated failures
- **Partition**: Grouped instances, isolated failures

**Enhanced Networking**:
- ENA (Elastic Network Adapter): Up to 100 Gbps
- Intel 82599 VF: Up to 10 Gbps (legacy)
- Nitro-based instances required for ENA

**Elastic Fabric Adapter (EFA)**:
- HPC, ML workloads
- OS-bypass, lower latency
- Supports MPI (Message Passing Interface)

**Jumbo Frames**:
- MTU up to 9001 bytes (default 1500)
- Reduces overhead for large data transfers
- Supported within VPC
- Not supported over internet

**TCP Optimization**:
- TCP window scaling
- Selective acknowledgments
- Timestamps

**Bandwidth Considerations**:
- Single-flow limit (5 Gbps for c5n.18xlarge)
- Multi-flow can reach instance bandwidth limit
- Same region, same AZ: Highest bandwidth
- Cross-region: Uses AWS backbone

### DNS Best Practices

**Split-View DNS**:
- Public hosted zone for external
- Private hosted zone for internal
- Same domain, different records

**Alias Records**:
- Use for AWS resources (free queries)
- ELB, CloudFront, S3, API Gateway

**Health Checks**:
- Monitor endpoints
- Failover routing
- String matching for content verification

**TTL Strategy**:
- Low TTL (60s): Fast updates, higher query volume
- High TTL (3600s): Fewer queries, slower updates
- Reduce TTL before planned changes

### Disaster Recovery

**Strategies**:
1. **Backup and Restore**: Lowest cost, highest RTO/RPO
2. **Pilot Light**: Core components running, scale up on DR
3. **Warm Standby**: Scaled-down version running
4. **Multi-Site Active-Active**: Full capacity, lowest RTO/RPO

**Network Considerations**:
- Cross-region VPC peering or TGW peering
- Route 53 health checks and failover
- Global Accelerator for fast failover
- Pre-allocated Elastic IPs
- Document runbooks

**RTO** (Recovery Time Objective): Time to recover
**RPO** (Recovery Point Objective): Data loss tolerance

### Compliance and Governance

**Network Segmentation**:
- Separate VPCs for environments (prod, dev, test)
- Separate subnets for tiers (web, app, db)
- Security groups for instance-level isolation

**Compliance Frameworks**:
- PCI DSS: Network segmentation, encryption, logging
- HIPAA: Encryption, access controls, audit logs
- SOC 2: Security controls, monitoring, documentation

**Tagging**:
- Cost allocation
- Resource organization
- Automation

**Resource Policies**:
- S3 bucket policies
- VPC endpoint policies
- Control access to resources

### Troubleshooting Methodology

**Connectivity Issues**:
1. Verify route tables (path exists?)
2. Check security groups (allow traffic?)
3. Check NACLs (allow traffic both ways?)
4. Check instance firewall (OS-level)
5. Verify application listening on port
6. VPC Flow Logs (see ACCEPT or REJECT)
7. Reachability Analyzer (identify blocking component)

**Performance Issues**:
1. CloudWatch metrics (bandwidth, latency)
2. Placement groups (optimize for low latency)
3. Enhanced networking enabled?
4. MTU size (jumbo frames for large transfers)
5. TCP settings (window size, congestion control)
6. Instance type (network bandwidth limit)

**Intermittent Issues**:
1. Check health checks (flapping targets)
2. CloudWatch alarms for spikes
3. VPC Flow Logs over time
4. Auto-scaling events
5. Spot instance interruptions

**DNS Issues**:
1. DNS resolution enabled in VPC?
2. Route 53 Resolver configuration
3. Private hosted zone associated with VPC?
4. Query logs (Route 53 Resolver Query Logging)
5. On-premises DNS forwarding configured?

**High Costs**:
1. Data transfer costs (cross-AZ, cross-region, to internet)
2. NAT Gateway data processing
3. VPC endpoint hours
4. Idle resources (Load Balancers, NAT Gateways)
5. Cost Explorer, tagging

---

## 14. AWS Networking Services Quick Reference

### Service Selection Guide

| Requirement | AWS Service |
|-------------|-------------|
| Isolated network in AWS | VPC |
| Internet access for public subnet | Internet Gateway |
| Internet access for private subnet | NAT Gateway / NAT Instance |
| IPv6 outbound-only | Egress-Only Internet Gateway |
| Connect two VPCs (simple) | VPC Peering |
| Connect multiple VPCs (hub-and-spoke) | Transit Gateway |
| Private access to AWS services | VPC Endpoints (Gateway or Interface) |
| Expose service to other VPCs | PrivateLink (VPC Endpoint Service) |
| Site-to-site VPN | AWS Site-to-Site VPN |
| Dedicated private connection | AWS Direct Connect |
| Global DNS, routing policies | Route 53 |
| Hybrid DNS resolution | Route 53 Resolver |
| Content delivery, caching | CloudFront |
| Static IPs, global traffic management | Global Accelerator |
| Layer 7 load balancing | ALB |
| Layer 4 load balancing, static IPs | NLB |
| Virtual appliances (firewall, IDS/IPS) | Gateway Load Balancer |
| Instance-level firewall | Security Groups |
| Subnet-level firewall | NACLs |
| Web application firewall | AWS WAF |
| DDoS protection | AWS Shield |
| Centralized firewall management | AWS Firewall Manager |
| Advanced VPC firewall | AWS Network Firewall |
| Network traffic mirroring | VPC Traffic Mirroring |
| Network diagnostics | VPC Reachability Analyzer |
| Traffic logging | VPC Flow Logs |
| API call logging | CloudTrail |
| Configuration tracking | AWS Config |

### Port Reference

| Service | Port | Protocol |
|---------|------|----------|
| HTTP | 80 | TCP |
| HTTPS | 443 | TCP |
| SSH | 22 | TCP |
| RDP | 3389 | TCP |
| FTP | 21 | TCP |
| FTPS | 989, 990 | TCP |
| SMTP | 25 | TCP |
| SMTPS | 465 | TCP |
| DNS | 53 | UDP (mostly), TCP |
| NTP | 123 | UDP |
| DHCP | 67, 68 | UDP |
| MySQL | 3306 | TCP |
| PostgreSQL | 5432 | TCP |
| Oracle | 1521 | TCP |
| SQL Server | 1433 | TCP |
| Redis | 6379 | TCP |
| Memcached | 11211 | TCP |
| Elasticsearch | 9200, 9300 | TCP |
| MongoDB | 27017 | TCP |
| Kafka | 9092 | TCP |
| Kubernetes API | 6443 | TCP |
| BGP | 179 | TCP |
| IPSec NAT-T | 4500 | UDP |
| IPSec IKE | 500 | UDP |
| GENEVE (GWLB) | 6081 | UDP |

### CIDR Quick Reference

| CIDR | Subnet Mask | Total IPs | Usable IPs (AWS) |
|------|-------------|-----------|------------------|
| /32 | 255.255.255.255 | 1 | 1 (for rules) |
| /31 | 255.255.255.254 | 2 | Not for subnets |
| /30 | 255.255.255.252 | 4 | Not for subnets |
| /29 | 255.255.255.248 | 8 | 3 |
| /28 | 255.255.255.240 | 16 | 11 |
| /27 | 255.255.255.224 | 32 | 27 |
| /26 | 255.255.255.192 | 64 | 59 |
| /25 | 255.255.255.128 | 128 | 123 |
| /24 | 255.255.255.0 | 256 | 251 |
| /23 | 255.255.254.0 | 512 | 507 |
| /22 | 255.255.252.0 | 1024 | 1019 |
| /21 | 255.255.248.0 | 2048 | 2043 |
| /20 | 255.255.240.0 | 4096 | 4091 |
| /19 | 255.255.224.0 | 8192 | 8187 |
| /18 | 255.255.192.0 | 16384 | 16379 |
| /17 | 255.255.128.0 | 32768 | 32763 |
| /16 | 255.255.0.0 | 65536 | 65531 |

---

## 15. Exam Focus Areas

### High-Priority Topics

**VPC Design**:
- Subnet design and CIDR planning
- Route table configuration
- Multi-tier architectures
- HA and fault tolerance

**Hybrid Connectivity**:
- Direct Connect vs VPN
- Transit Gateway architectures
- Route propagation and BGP
- HA designs for hybrid connectivity

**Network Security**:
- Security groups vs NACLs
- VPC endpoints and PrivateLink
- WAF rules and Shield
- Network Firewall use cases

**Advanced Routing**:
- BGP attributes and path selection
- Transit Gateway route tables
- Complex multi-VPC/multi-account routing
- Route priority and evaluation

**Troubleshooting**:
- VPC Flow Logs analysis
- Reachability Analyzer usage
- CloudWatch metrics interpretation
- Common connectivity issues

**Performance Optimization**:
- Direct Connect vs VPN performance
- Enhanced networking
- Placement groups
- MTU and jumbo frames

**Cost Optimization**:
- NAT Gateway vs NAT Instance
- VPC endpoint pricing
- Data transfer costs
- Cross-AZ and cross-region charges

### Common Exam Scenarios

**Scenario 1**: Design highly available hybrid connectivity
- Answer: Multiple Direct Connect connections in different locations + VPN backup

**Scenario 2**: Connect hundreds of VPCs
- Answer: Transit Gateway (not VPC peering - doesn't scale)

**Scenario 3**: Private access to S3 from VPC
- Answer: Gateway VPC Endpoint (free, better than interface endpoint for S3)

**Scenario 4**: Expose service to multiple VPCs without peering
- Answer: PrivateLink with VPC Endpoint Service

**Scenario 5**: Block specific IP addresses
- Answer: Network ACL (deny rules) or AWS WAF (IP sets)

**Scenario 6**: Outbound internet for private subnet
- Answer: NAT Gateway in public subnet + route 0.0.0.0/0 to NAT GW

**Scenario 7**: On-premises to VPC DNS resolution
- Answer: Route 53 Resolver with inbound/outbound endpoints

**Scenario 8**: Static IPs for global application
- Answer: Global Accelerator

**Scenario 9**: Centralized security for multi-account
- Answer: Firewall Manager

**Scenario 10**: Mirror traffic for security analysis
- Answer: VPC Traffic Mirroring to security appliance

**Scenario 11**: Route to different targets based on URL path
- Answer: ALB with path-based routing

**Scenario 12**: High-performance, low-latency load balancing
- Answer: NLB

**Scenario 13**: Encrypt Direct Connect traffic
- Answer: VPN over Direct Connect (Public VIF + VPN) or MACsec

**Scenario 14**: Prevent accidental security group rule deletions
- Answer: AWS Config rules + remediation

**Scenario 15**: Aggregate bandwidth across multiple VPN tunnels
- Answer: ECMP with Transit Gateway (not VGW)

### Key Concepts to Memorize

**VPC Limits**:
- 5 VPCs per region (soft)
- 5 EIPs per region (soft)
- 5 VPC CIDR blocks (soft)
- 200 route tables per VPC (soft)

**Reserved IPs**:
- 5 per subnet (.0, .1, .2, .3, .255)

**BGP AS Paths**:
- Shortest AS path wins
- Local Preference (higher wins)
- MED (lower wins)

**Route Priority**:
- Longest prefix match wins
- Local routes > static > propagated

**Security Groups**:
- Stateful
- Allow rules only
- Evaluated together (all rules)

**NACLs**:
- Stateless
- Allow and deny rules
- Rules processed in order

**Direct Connect**:
- 1, 10, 100 Gbps (dedicated)
- 50 Mbps - 10 Gbps (hosted)
- Private VIF: VPC access
- Public VIF: AWS public services
- Transit VIF: Transit Gateway

**Load Balancers**:
- ALB: Layer 7, path/host routing
- NLB: Layer 4, static IPs, high performance
- GWLB: Layer 3, virtual appliances
- CLB: Legacy

**VPC Endpoints**:
- Gateway: S3, DynamoDB only, free
- Interface: Most services, charged

**Transit Gateway**:
- 5000 attachments
- 50 Gbps per VPC attachment
- Transitive routing
- Multiple route tables for isolation

### Time Management

**Exam Details**:
- 170 minutes
- 65 questions
- ~2.6 minutes per question

**Strategy**:
- Read question carefully (identify key requirements)
- Eliminate obviously wrong answers
- Flag difficult questions, return later
- Watch for keywords (cost-effective, highly available, lowest latency)
- Beware of "all of the above" or "none of the above"

### Final Tips

1. **Hands-on practice**: Create VPCs, subnets, configure routing
2. **Understand "why"**: Not just "how" but "when to use"
3. **Focus on differences**: VPC Peering vs TGW, ALB vs NLB, Security Groups vs NACLs
4. **HA designs**: Always consider multi-AZ, multi-region
5. **Security**: Least privilege, defense in depth
6. **Cost**: NAT Gateway data processing, cross-AZ data transfer
7. **Troubleshooting**: Flow Logs, Reachability Analyzer, CloudWatch
8. **Hybrid**: Direct Connect + VPN, BGP, Transit Gateway
9. **Whitelist CIDR sizes**: /28 minimum for subnet, /16 maximum for VPC
10. **Know service limits**: When to request increase
