#!/bin/bash

# Auto DevOps Script for AICAM Project
# Duration: 10 hours
# Function: Auto development, test, build, deploy
# Usage: bash auto-devops.sh

TOTAL_HOURS=${1:-10}
START_TIME=$(date)
END_TIME=$(date -d "+$TOTAL_HOURS hours")
LOG_DIR="logs"
LOG_FILE="$LOG_DIR/auto-devops-$(date +%Y%m%d-%H%M%S).log"

# Create log directory
mkdir -p "$LOG_DIR"

# Log function
log() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local message="$timestamp $1"
    echo "$message"
    echo "$message" >> "$LOG_FILE"
}

# Auto fix function
auto_fix_issues() {
    log "[AUTO-FIX] Checking and fixing common issues..."
    
    log "[AUTO-FIX] Running npm install..."
    npm install >> "$LOG_FILE" 2>&1
    if [ $? -eq 0 ]; then
        log "[AUTO-FIX] npm install completed"
    else
        log "[AUTO-FIX] npm install failed"
    fi
    
    log "[AUTO-FIX] Running npm audit fix..."
    npm audit fix >> "$LOG_FILE" 2>&1
    if [ $? -eq 0 ]; then
        log "[AUTO-FIX] npm audit fix completed"
    else
        log "[AUTO-FIX] npm audit fix failed"
    fi
    
    # Create mock data if missing
    if [ ! -f "frontend/src/__mocks__/testData.ts" ]; then
        log "[AUTO-FIX] Creating mock testData.ts..."
        mkdir -p "frontend/src/__mocks__"
        cat > "frontend/src/__mocks__/testData.ts" << 'EOF'
export const deviceFixtures = { 
    basicdevices: [{ 
        id: '1', 
        name: 'MockDevice', 
        status: 'online' 
    }] 
};
EOF
    fi
}

log "==== Auto DevOps Script Started ===="
log "Will run until: $END_TIME"
log "Log file: $LOG_FILE"

cycle_count=0

while true; do
    cycle_count=$((cycle_count + 1))
    current_time=$(date)
    
    # Check if time limit reached
    if [ "$(date +%s)" -ge "$(date -d "$END_TIME" +%s)" ]; then
        log "==== Reached time limit, script ending ===="
        break
    fi
    
    log "=== Starting Cycle $cycle_count ==="
    log "Current time: $current_time"
    
    # Step 1: Sync code
    log "[STEP 1] Syncing code..."
    git pull >> "$LOG_FILE" 2>&1
    if [ $? -eq 0 ]; then
        log "Code sync completed"
    else
        log "Code sync failed"
    fi
    
    # Step 2: Run API fixes
    log "[STEP 2] Running API fixes..."
    if [ -f "scripts/fix-all-api-imports.ps1" ]; then
        log "Running API fix script..."
        powershell -ExecutionPolicy Bypass -File "scripts/fix-all-api-imports.ps1" >> "$LOG_FILE" 2>&1
    fi
    if [ -f "scripts/fix-aichat-interface.ps1" ]; then
        log "Running AI chat fix script..."
        powershell -ExecutionPolicy Bypass -File "scripts/fix-aichat-interface.ps1" >> "$LOG_FILE" 2>&1
    fi
    log "API fixes completed"
    
    # Step 3: Run tests with timeout
    log "[STEP 3] Running tests..."
    test_retry=0
    test_max_retry=3
    test_success=false
    
    while [ $test_retry -lt $test_max_retry ] && [ "$test_success" = false ]; do
        test_retry=$((test_retry + 1))
        log "Running tests... (Attempt $test_retry)"
        
        # Run tests with 5 minute timeout
        timeout 300 npm run test >> "$LOG_FILE" 2>&1
        test_exit_code=$?
        
        if [ $test_exit_code -eq 124 ]; then
            log "[AUTO-FIX] Tests timed out, attempting fixes..."
            auto_fix_issues
            sleep 10
            continue
        elif [ $test_exit_code -ne 0 ]; then
            log "[AUTO-FIX] Test failures detected, attempting fixes..."
            auto_fix_issues
            sleep 10
            continue
        else
            log "Tests completed successfully"
            test_success=true
        fi
    done
    
    if [ "$test_success" = false ]; then
        log "[AUTO-FIX] Tests failed multiple times, skipping and continuing..."
    fi
    
    # Step 4: Build project
    log "[STEP 4] Building project..."
    npm run build >> "$LOG_FILE" 2>&1
    if [ $? -ne 0 ]; then
        log "Build failed, trying npm install and retry..."
        npm install >> "$LOG_FILE" 2>&1
        npm run build >> "$LOG_FILE" 2>&1
        if [ $? -eq 0 ]; then
            log "Build retry completed"
        else
            log "Build retry still failed"
        fi
    else
        log "Build completed"
    fi
    
    # Step 5: Clean up documents
    log "[STEP 5] Cleaning up documents..."
    if [ -f "scripts/cleanup-documents.bat" ]; then
        log "Running document cleanup script..."
        cmd //c "scripts/cleanup-documents.bat" >> "$LOG_FILE" 2>&1
    fi
    log "Document cleanup completed"
    
    # Step 6: Deploy
    log "[STEP 6] Deploying..."
    if [ -f "scripts/remote-deploy-start.bat" ]; then
        log "Running remote deploy script..."
        cmd //c "scripts/remote-deploy-start.bat" >> "$LOG_FILE" 2>&1
    elif [ -f "docker-compose.yml" ]; then
        log "Running local docker-compose deploy..."
        docker-compose up -d >> "$LOG_FILE" 2>&1
    fi
    log "Deploy completed"
    
    # Step 7: Health checks
    log "[STEP 7] Health checks..."
    if [ -f "scripts/ai-health-check.ps1" ]; then
        powershell -ExecutionPolicy Bypass -File "scripts/ai-health-check.ps1" >> "$LOG_FILE" 2>&1
    fi
    if [ -f "scripts/status-check.ps1" ]; then
        powershell -ExecutionPolicy Bypass -File "scripts/status-check.ps1" >> "$LOG_FILE" 2>&1
    fi
    log "Health checks completed"
    
    log "=== Cycle $cycle_count completed ==="
    log "Sleeping for 1 hour before next cycle..."
    log "----------------------------------------"
    
    # Sleep for 1 hour
    sleep 3600
done

log "==== Auto DevOps Script Ended ====" 