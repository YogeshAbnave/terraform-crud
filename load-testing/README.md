# Load Testing Guide for ALB and Auto Scaling

This directory contains scripts to test your Application Load Balancer and Auto Scaling Group.

## Quick Start

### 1. Install Locust (if not already installed)

```powershell
pip install locust
```

Verify installation:
```powershell
locust --version
```

### 2. Run Load Test

**Option A: Using the PowerShell script (Recommended)**

```powershell
cd load-testing
.\run-load-test.ps1
```

**Option B: Manual Locust command**

```powershell
cd load-testing
locust -f locustfile.py --host=http://crud-app-alb-263940571.ap-south-1.elb.amazonaws.com
```

Then open browser: http://localhost:8089

### 3. Monitor Scaling (in separate terminal)

```powershell
cd load-testing
.\monitor-scaling.ps1
```

## Test Scenarios

### Scenario 1: Balanced Load (Default)
Tests all CRUD operations with realistic distribution.

```powershell
.\run-load-test.ps1 -Users 200 -SpawnRate 10 -TestType "balanced"
```

### Scenario 2: Read-Heavy Load
Tests ALB distribution with mostly GET requests.

```powershell
.\run-load-test.ps1 -Users 500 -SpawnRate 20 -TestType "read-heavy"
```

### Scenario 3: Write-Heavy Load
Tests Auto Scaling with CPU-intensive write operations.

```powershell
.\run-load-test.ps1 -Users 300 -SpawnRate 15 -TestType "write-heavy"
```

### Scenario 4: Spike Test
Simulates sudden traffic spike.

```powershell
.\run-load-test.ps1 -Users 1000 -SpawnRate 100 -TestType "balanced"
```

## What to Monitor

### In Locust Web UI (http://localhost:8089)
- ✅ Total Requests Per Second (RPS)
- ✅ Response Times (median, 95th percentile)
- ✅ Failure Rate
- ✅ Number of Users

### In Monitor Script
- ✅ ASG Desired Capacity changes
- ✅ Number of healthy instances
- ✅ Scaling activities (launch/terminate)
- ✅ CloudWatch alarm states
- ✅ Target group health

### In AWS Console

**Auto Scaling Group:**
- EC2 → Auto Scaling Groups → crud-app-asg
- Check "Activity" tab for scaling events
- Check "Monitoring" tab for metrics

**Load Balancer:**
- EC2 → Load Balancers → crud-app-alb
- Check "Target groups" → crud-app-tg → "Targets" tab
- Check "Monitoring" tab for request metrics

**CloudWatch:**
- CloudWatch → Alarms
  - crud-app-high-cpu (should trigger at 70% CPU)
  - crud-app-low-cpu (should trigger at 30% CPU)
- CloudWatch → Metrics → EC2 → By Auto Scaling Group
  - CPUUtilization
  - NetworkIn/NetworkOut

## Expected Behavior

### Load Balancer
1. ✅ Distributes traffic evenly across healthy instances
2. ✅ Removes unhealthy instances from rotation
3. ✅ Health checks pass (200 OK on /)
4. ✅ No 5xx errors under normal load

### Auto Scaling
1. ✅ Maintains minimum 2 instances
2. ✅ Scales up when CPU > 70% for 2 evaluation periods (4 minutes)
3. ✅ Scales down when CPU < 30% for 2 evaluation periods (4 minutes)
4. ✅ New instances register with target group automatically
5. ✅ Respects cooldown period (300 seconds)

## Troubleshooting

### No scaling happening?
- Check CloudWatch alarms are in "ALARM" state
- Verify CPU threshold is being exceeded
- Wait for evaluation periods (4 minutes)
- Check ASG activity history for errors

### High failure rate in Locust?
- Check target group health in AWS Console
- Verify instances are healthy
- Check application logs in CloudWatch
- Verify DynamoDB table is accessible

### Instances not registering with ALB?
- Check security group rules
- Verify health check path returns 200
- Check instance is in correct subnets
- Wait for health check grace period (300 seconds)

## Advanced Testing

### Test Instance Failure
1. Start load test with 200 users
2. Manually terminate one EC2 instance
3. Watch ASG launch replacement
4. Verify no service disruption

### Test Manual Scaling
```powershell
# Scale up manually
aws autoscaling set-desired-capacity --auto-scaling-group-name crud-app-asg --desired-capacity 3

# Watch new instance launch and register
.\monitor-scaling.ps1
```

### Test Health Check Failure
1. SSH into an instance
2. Stop the application service
3. Watch ALB mark it unhealthy
4. Verify traffic routes to healthy instances

## Cleanup

Stop load test:
- Press Ctrl+C in Locust terminal
- Or click "Stop" in web UI

Stop monitoring:
- Press Ctrl+C in monitor terminal

## Files

- `locustfile.py` - Load testing scenarios
- `run-load-test.ps1` - Easy test launcher
- `monitor-scaling.ps1` - Real-time monitoring
- `README.md` - This file

## Tips

1. Start with low user count (100-200) and increase gradually
2. Run monitoring script in separate terminal for real-time feedback
3. Wait 5-10 minutes for Auto Scaling to react
4. Check CloudWatch alarms to confirm thresholds are being hit
5. Use write-heavy test to trigger CPU-based scaling faster

## Your ALB URL

```
http://crud-app-alb-263940571.ap-south-1.elb.amazonaws.com
```

Test it's working:
```powershell
curl http://crud-app-alb-263940571.ap-south-1.elb.amazonaws.com/items
```
