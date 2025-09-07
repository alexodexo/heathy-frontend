


```bash
cd /home/has40/heathy/frontend-prod
rsync -av --exclude=node_modules --exclude=.next --exclude=.git ../frontend/ ./
```

```bash
npm install
npm run build
```

---

## 4. Production-Server neustarten (Supervisor)

```bash
sudo supervisorctl restart heathy-frontend-prod
```

---

## 5. **Prod-Server auf Port 80 laufen lassen**

### **Empfohlener Weg:** Reverse Proxy mit Nginx

* Installiere Nginx (falls noch nicht):

  ```bash
  sudo apt install nginx
  ```

* Erstelle (oder bearbeite) eine Config unter `/etc/nginx/sites-available/nextjs`:

  ```nginx
  server {
      listen 80;
      server_name _; # oder deine Domain

      location / {
          proxy_pass http://localhost:3000; # Next.js läuft intern auf 3000!
          proxy_http_version 1.1;
          proxy_set_header Upgrade $http_upgrade;
          proxy_set_header Connection 'upgrade';
          proxy_set_header Host $host;
          proxy_cache_bypass $http_upgrade;
      }
  }
  ```

* Aktiviere die Config:

  ```bash
  sudo ln -sf /etc/nginx/sites-available/nextjs /etc/nginx/sites-enabled/nextjs
  sudo nginx -t
  sudo systemctl reload nginx
  ```

* **Wichtig:**
  In deiner `supervisor`-Config sollte Next.js weiterhin auf Port 3000 laufen (Standard):

  ```ini
  [program:heathy-frontend-prod]
  directory=/home/has40/heathy/frontend-prod
  command=/usr/bin/npm start
  autostart=true
  autorestart=true
  stderr_logfile=/var/log/heathy-frontend-prod.err.log
  stdout_logfile=/var/log/heathy-frontend-prod.out.log
  user=has40
  environment=PORT=3000
  ```

  **Nicht direkt auf Port 80 starten!** Das geht nur als root und ist sehr unüblich. Lass lieber Nginx als Reverse Proxy laufen.

---

## **Zusammengefasste Befehle (nach jedem Update):**

```bash
cd /home/has40/heathy/frontend-prod
rsync -av --exclude=node_modules --exclude=.next ../frontend/ ./
npm install
npm run build
sudo supervisorctl restart heathy-frontend-prod
```
