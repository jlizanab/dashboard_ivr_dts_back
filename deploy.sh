#rsync -avz -e "ssh -i ~/projects/athena/Oracle/OpenSSH-and-API_private.pem" ./ opc@129.151.115.247:/home/opc/apps/dashboard_ivr_dts/backend
rsync -avzh ./ lrosas@192.168.1.8:/home/lrosas/athena_apps/dashboard_ivr_dts_api
