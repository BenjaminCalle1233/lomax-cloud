# Comandos para la defensa

Ejecutar desde la carpeta raíz del proyecto. Usar una sección a la vez.

## Docker

```powershell
docker compose up -d --build
docker compose ps
docker network ls
docker volume ls
docker compose logs backend
curl.exe -H "Connection: close" http://localhost/api/health
```

## Kubernetes (Docker Desktop)

```powershell
docker compose down
docker compose build frontend backend
kubectl apply -f kubernetes/
kubectl get pods
kubectl get deployments
kubectl get services
kubectl get pvc
kubectl scale deployment backend --replicas=3
kubectl get pods -l app=backend
curl.exe -H "Connection: close" http://localhost/api/health
kubectl logs NOMBRE_POD_BACKEND
kubectl describe pod NOMBRE_POD_BACKEND
kubectl delete pod NOMBRE_POD_BACKEND
kubectl get pods -l app=backend
```

## Persistencia Kubernetes

```powershell
curl.exe http://localhost/api/orders
kubectl delete pod -l app=postgres
kubectl get pods -l app=postgres -w
curl.exe http://localhost/api/orders
```

Conservar el PVC. Si el puerto 80 está ocupado, consultar la alternativa de puerto en [README.md](README.md) y usar `localhost:8080` en los comandos HTTP.
