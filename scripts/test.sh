



#!/bin/bash

# Function to measure execution time
measure_command() {
    local description=$1
    local command=$2
    
    echo "Executing: $description"
    echo "Command: $command"
    echo "----------------------------------------"
    
    # Record start time
    start_time=$(date +%s.%N)
    
    # Execute the command
    eval $command
    
    # Record end time
    end_time=$(date +%s.%N)
    
    # Calculate execution time
    execution_time=$(echo "$end_time - $start_time" | bc)
    
    echo "----------------------------------------"
    printf "Execution time: %.3f seconds\n\n" $execution_time
}

# Execute each command with timing
measure_command "Sign up backend" 'dfx canister call backend sign_up '\''(record {logo="logogogog"; name= "Leggggg"; pay_id = "lets_goo"})'\'''
sleep 5
measure_command "Sign up business backend2" 'dfx canister call backend2 signUpBusiness '\''(record {logo="logogogog"; name= "Leggggg"; pay_id = "lets_goo"})'\'''
sleep 5
measure_command "Get business from backend" 'dfx canister call backend get_business'
sleep 5
measure_command "Get business from backend (alternative method)" 'dfx canister call backend2 getBusiness'