#!/bin/bash

ssh -t -p 22 ubuntu@100.86.93.41 "cd ~/docker/smtp-node-api && source ~/.zshrc && nvm use 22 && bash -lc 'npm run cli'"