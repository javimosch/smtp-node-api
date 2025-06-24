#!/bin/bash

function remote_config {
  ssh -t -p 22 ubuntu@100.86.93.41 "cd ~/docker/smtp-node-api && source ~/.zshrc && nvm use 22 && bash -lc 'npm run cli'"
}

function follow_logs {
  ssh -t -p 22 ubuntu@100.86.93.41 "cd ~/docker/smtp-node-api && docker-compose logs -f"
}

function deploy {
  ./deploy.sh
}

function deploy_domain {
  ./deploy-domain.sh
}

# Display interactive menu
echo "===== SMTP Node API Remote Management ====="
PS3="Please select an option: "
options=("Start CLI in remote" "Follow logs in remote" "Deploy to remote" "Deploy domain to remote (Traefik gateway)" "Exit")
select opt in "${options[@]}"
do
  case $opt in
    "Start CLI in remote")
      remote_config
      break
      ;;
    "Follow logs in remote")
      follow_logs
      break
      ;;
    "Deploy to remote")
      deploy
      break
      ;;
    "Deploy domain to remote (Traefik gateway)")
      deploy_domain
      break
      ;;
    "Exit")
      echo "Exiting..."
      exit 0
      ;;
    *) 
      echo "Invalid option. Please try again."
      ;;
  esac
done