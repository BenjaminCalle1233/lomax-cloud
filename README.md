# Lomax SA

Aplicación local para consultar productos y clientes, registrar pedidos y ver sus detalles. React + Vite + TypeScript + Tailwind, NestJS + Prisma, PostgreSQL y Nginx.

```text
Navegador → Nginx (:80) → / → React
                       → /api → NestJS → PostgreSQL → almacenamiento persistente
```

Nginx es el único acceso público. El backend lee los precios de PostgreSQL y crea cada pedido con sus detalles en una transacción. El seed crea 10 clientes, 20 productos y 20 pedidos solo si la base está vacía; los datos posteriores se conservan.

## Docker Compose

```bash
docker compose up -d --build
docker compose ps
```

Abrir **http://localhost**. El proxy es el único servicio con puerto publicado; PostgreSQL usa el volumen `postgres_data`. Para inspeccionar: `docker network ls`, `docker volume ls`, `docker compose logs backend`. Para detener sin borrar datos: `docker compose down`.

Si el puerto 80 está ocupado, libéralo. En Windows, IIS/W3SVC puede reservarlo; una consola de administrador puede ejecutar `Stop-Service W3SVC`. Como alternativa temporal para Docker: en PowerShell, `$env:LOMAX_PORT=8080` y luego `docker compose up -d --build`; abrir `http://localhost:8080`. Quitar la variable para volver al puerto 80.

## Kubernetes local (Docker Desktop)

Activar Kubernetes en Docker Desktop y verificar `kubectl config current-context` (`docker-desktop`). Docker Desktop debe usar el mismo almacén de imágenes que `docker`. Detener Compose antes de usar el mismo puerto.

```bash
docker compose down
docker compose build frontend backend
kubectl apply -f kubernetes/
kubectl get pods
kubectl get deployments
kubectl get services
kubectl get pvc
```

Los Deployments usan `lomax-frontend:local` y `lomax-backend:local`, sin registro externo. El Service `proxy` es `LoadBalancer` en puerto 80; en Docker Desktop se abre **http://localhost** cuando el puerto está libre. Si no se publica en localhost, dejar ejecutándose `kubectl port-forward service/proxy 8080:80` en otra terminal y abrir `http://localhost:8080`. En ese caso, usar `localhost:8080` en los comandos HTTP siguientes.

Al reconstruir una imagen con la misma etiqueta `:local`, Kubernetes puede reutilizar su copia en caché por `imagePullPolicy: IfNotPresent`. Para desplegar cambios posteriores, asignar una etiqueta nueva tanto a la imagen construida como al Deployment.

```bash
kubectl scale deployment backend --replicas=3
kubectl get pods -l app=backend
curl.exe -H "Connection: close" http://localhost/api/health
kubectl delete pod NOMBRE_POD_BACKEND
kubectl get pods -l app=backend
```

Cada respuesta de `/api/health` incluye el hostname del Pod. Repetir el comando varias veces con conexiones nuevas para observar distintos Pods. El Deployment repone un Pod eliminado. El PVC `postgres-pvc` conserva los pedidos al recrear el Pod PostgreSQL:

```bash
curl.exe http://localhost/api/orders
kubectl delete pod -l app=postgres
kubectl get pods -l app=postgres -w
curl.exe http://localhost/api/orders
```

No borrar el PVC durante esa demostración. Compose y Kubernetes tienen volúmenes separados, por lo que sus pedidos no se comparten.

## API mínima

`GET /api/health`, `GET /api/products`, `GET /api/products/:id`, `GET /api/clients`, `GET /api/clients/:id`, `GET /api/orders`, `GET /api/orders/:id` y `POST /api/orders`.

```json
{"clientId":1,"items":[{"productId":1,"quantity":2}]}
```

# Defensa rápida — 15 minutos

- **0–2 min:** dibujar Navegador → Nginx → React/NestJS → PostgreSQL → volumen o PVC.
- **2–5 min:** abrir Inicio, Productos, Clientes y Pedidos; registrar un pedido y ver el detalle.
- **5–7 min:** `docker compose ps`, `docker network ls`, `docker volume ls`; explicar 4 contenedores, 2 redes y 1 volumen.
- **7–10 min:** `kubectl get pods`, `kubectl get deployments`, `kubectl get services`, `kubectl get pvc`.
- **10–12 min:** `kubectl scale deployment backend --replicas=3`; mostrar 3 Pods y hostname en `/api/health`.
- **12–13 min:** borrar un Pod backend y mostrar su reemplazo.
- **13–15 min:** borrar el Pod PostgreSQL, comprobar el mismo pedido y explicar el recorrido de una petición.

Comandos listos para copiar en [DEFENSA.md](DEFENSA.md).
