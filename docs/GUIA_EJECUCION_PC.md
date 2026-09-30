# Guía de ejecución de Lomax en Windows

## Preparación de tu PC

Al terminar esta revisión se dejó Kubernetes activo con el backend en tres réplicas y la aplicación accesible en http://localhost. Docker Compose quedó detenido y su volumen se conservó. Ya puedes abrir la aplicación. Para ejecutar también Compose mientras Kubernetes ocupa el puerto 80, elige LOMAX_PORT=8080 antes de arrancarlo como se explica abajo.

En la revisión del 29 de septiembre de 2026 se encontró Docker Desktop instalado por usuario, motor Linux disponible, WSL 2 y un nodo Kubernetes Ready en el contexto docker-desktop. No necesitas reinstalarlo. Los comandos no estaban en el PATH de la terminal revisada.

Abre Docker Desktop y déjalo funcionando. Abre PowerShell y ejecuta:

```powershell
Set-Location 'C:\Users\PC\Desktop\tecemer\lomax'
$env:PATH = "$env:LOCALAPPDATA\Programs\DockerDesktop\resources\bin;$env:PATH"
docker version
docker compose version
kubectl config current-context
kubectl get nodes
```

Docker debe mostrar Client y Server; Kubernetes debe indicar docker-desktop y un nodo Ready. La modificación de PATH sirve para esa terminal: repítela en cada PowerShell nuevo o agrega la carpeta a las variables de entorno del usuario. No necesitas npm, Node ni PostgreSQL instalados fuera de Docker para esta ruta.

Si reinstalas en otra PC, sigue [Docker Desktop para Windows](https://docs.docker.com/desktop/setup/install/windows-install/). La ruta por usuario y el modo de creación de clúster están documentados en [Kubernetes de Docker Desktop](https://docs.docker.com/desktop/use-desktop/kubernetes/).

## Evitar copiar dependencias Windows a las imágenes Linux

El proyecto ya incluye backend/.dockerignore y frontend/.dockerignore. Comprueba que siguen excluyendo estas rutas antes de construir:

```text
node_modules
dist
.env
*.tsbuildinfo
*.log
```

En este proyecto ya hay node_modules locales. Excluirlos permite que los Dockerfiles conserven los paquetes Linux instalados por npm ci y, en backend, el cliente Prisma generado dentro de la imagen. Los archivos existentes ya hacen esa separación.

## Arranque con Docker Compose

Desde la raíz del proyecto:

```powershell
docker compose config --quiet
docker compose up -d --build
docker compose ps
docker compose logs --tail=80 backend
```

La primera construcción descarga imágenes y dependencias. Deben aparecer proxy, frontend, backend y postgres activos; postgres debe estar healthy. En backend, el primer arranque de una base vacía debe mostrar la carga de 10 clientes, 20 productos y 20 pedidos. Arranques posteriores omiten la carga para preservar los datos.

Abre [Lomax local](http://localhost). Consulta Productos y Clientes, crea un pedido desde Nuevo Pedido y confirma que aparece en Pedidos y que puedes abrir su detalle.

Si el puerto 80 está ocupado, ejecuta:

```powershell
$env:LOMAX_PORT = '8080'
docker compose up -d
```

Abre [Lomax en puerto 8080](http://localhost:8080). Usa ese puerto también en las pruebas siguientes. No hace falta detener otros servicios de Windows.

## Verificar datos y registrar un pedido

```powershell
$baseUrl = 'http://localhost'
# Si elegiste puerto 8080, usa http://localhost:8080 arriba.
Invoke-RestMethod "$baseUrl/api/health"
$clientes = Invoke-RestMethod "$baseUrl/api/clients"
$productos = Invoke-RestMethod "$baseUrl/api/products"
$pedidos = Invoke-RestMethod "$baseUrl/api/orders"
[pscustomobject]@{ Clientes=$clientes.Count; Productos=$productos.Count; Pedidos=$pedidos.Count }
if ($pedidos.Count -lt 20) { throw 'No se cumple el mínimo de 20 pedidos' }
$cuerpo = @{
  clientId = $clientes[0].id
  items = @(@{ productId=$productos[0].id; quantity=2 })
} | ConvertTo-Json -Depth 5
$pedidoPrueba = Invoke-RestMethod "$baseUrl/api/orders" -Method Post -ContentType 'application/json' -Body $cuerpo
$pedidoId = $pedidoPrueba.id
Invoke-RestMethod "$baseUrl/api/orders/$pedidoId" | ConvertTo-Json -Depth 8
```

Guarda el ID del pedido creado y una captura del detalle. El mínimo obligatorio de TEMI es 20 pedidos; los 10 clientes y 20 productos son la carga elegida por el proyecto.

## Evidencias de redes y persistencia Docker

```powershell
docker compose ps
docker network inspect lomax_frontend-network
docker network inspect lomax_backend-network
docker volume inspect lomax_postgres_data
Invoke-RestMethod "$baseUrl/api/orders/$pedidoId" | ConvertTo-Json -Depth 8
docker compose up -d --force-recreate postgres
docker compose ps
```

Espera a que PostgreSQL vuelva a healthy. Luego repite la consulta del mismo ID. Si aparece 502 durante el reinicio, espera y revisa logs; si persiste, reinicia backend y proxy:

```powershell
docker compose restart backend proxy
Invoke-RestMethod "$baseUrl/api/orders/$pedidoId" | ConvertTo-Json -Depth 8
```

Las redes/volumen se llaman así al ejecutar desde la carpeta lomax sin cambiar el nombre de proyecto. Si no coinciden, consulta docker network ls y docker volume ls. Captura antes y después: el mismo pedido debe permanecer.

Para apagar conservando información:

```powershell
docker compose down
```

No agregues -v: elimina el volumen y los datos.

## Kubernetes local

Primero termina la prueba Docker y detenla para liberar el puerto:

```powershell
docker compose down
docker compose build frontend backend
kubectl config current-context
kubectl get nodes
kubectl apply -f kubernetes/
kubectl rollout status deployment/postgres --timeout=180s
kubectl rollout status deployment/backend --timeout=180s
kubectl rollout status deployment/frontend --timeout=180s
kubectl rollout status deployment/proxy --timeout=180s
kubectl get deployments,services,pods,pvc -o wide
```

Los archivos actuales se aplican al namespace del contexto; para esta guía debe ser default. Si configuraste otro, usa --namespace=default en todos los comandos. No uses -n lomax con estos archivos sin crear/aplicar ese namespace.

El PVC debe estar Bound y los cuatro Deployments disponibles. Si backend/frontend quedan ImagePullBackOff, el nodo no tiene las imágenes :local: consulta describe pod y usa la alternativa de imágenes siguiente. No repitas apply indefinidamente.

### Imágenes locales y Docker Desktop

El clúster detectado usa un nodo llamado desktop-control-plane y componentes kind. Durante la prueba, su integración con Docker Desktop permitió descargar las imágenes :local construidas en esta PC. Esto no garantiza que otro clúster ni una EC2 puedan hacerlo. Si aparece ImagePullBackOff, la vía más portable y alineada con TEMI es publicar las dos imágenes en Docker Hub y reemplazar en kubernetes/backend-deployment.yaml y frontend-deployment.yaml los nombres :local por usuario/lomax-backend:temi-v1 y usuario/lomax-frontend:temi-v1. Después aplica nuevamente los manifiestos y espera rollout. Esto también servirá en EC2.

### Acceso

Prueba http://localhost. Si el Service proxy no expone localhost, abre otra terminal, prepara PATH y deja este comando ejecutándose:

```powershell
kubectl port-forward service/proxy 8080:80
```

Abre http://localhost:8080 y configura $baseUrl = 'http://localhost:8080' en la terminal de pruebas. Ctrl+C termina el port-forward. Compose y Kubernetes tienen almacenamientos independientes; el pedido que creaste en Compose no tiene por qué aparecer en Kubernetes. Crea un pedido nuevo para esta fase.

## Demostraciones Kubernetes

### Una réplica y escalamiento a tres

```powershell
kubectl scale deployment/backend --replicas=1
kubectl rollout status deployment/backend --timeout=180s
kubectl get deployments backend
kubectl scale deployment/backend --replicas=3
kubectl rollout status deployment/backend --timeout=180s
kubectl get deployments backend
kubectl get pods -l app=backend -o wide
kubectl get endpointslices -l kubernetes.io/service-name=backend
1..15 | ForEach-Object { curl.exe --max-time 10 -s -H 'Connection: close' "$baseUrl/api/health" }
```

Captura 1/1 antes y 3/3 después, tres Pods Ready y endpoints. Los hostnames ayudan a observar reparto del Service, pero una muestra corta no garantiza ver los tres; revisa los tres Pods y endpoints además de las respuestas HTTP.

### Autorrecuperación

```powershell
$podAntes = kubectl get pods -l app=backend -o jsonpath='{.items[0].metadata.name}'
kubectl get pods -l app=backend
kubectl delete pod $podAntes
kubectl rollout status deployment/backend --timeout=180s
kubectl get pods -l app=backend
kubectl get deployments backend
```

Compara nombres antes/después y confirma 3/3. Borrar el Pod debe producir un reemplazo con nombre distinto.

### Persistencia

Repite el bloque de creación de pedido en Kubernetes y conserva $pedidoId en la misma terminal. Luego:

```powershell
Invoke-RestMethod "$baseUrl/api/orders/$pedidoId" | ConvertTo-Json -Depth 8
kubectl get pvc
kubectl delete pod -l app=postgres
kubectl rollout status deployment/postgres --timeout=180s
kubectl get pvc
Invoke-RestMethod "$baseUrl/api/orders/$pedidoId" | ConvertTo-Json -Depth 8
```

Si PostgreSQL todavía reinicia, espera antes de repetir la consulta. Debe sobrevivir el mismo ID y el PVC continuar Bound. No ejecutes kubectl delete -f kubernetes/ para apagar la demostración: también elimina el PVC declarado. Para detener las cargas conservando el PVC:

```powershell
kubectl scale deployment backend frontend proxy postgres --replicas=0
```

Para reanudar, aplica kubernetes/ y espera nuevamente los rollouts. Al aplicar los archivos, backend vuelve al valor declarado de una réplica.

## Publicar imágenes en Docker Hub

Esta sección es para cuando el equipo use su cuenta real. No se publicaron imágenes durante la revisión.

```powershell
$usuarioHub = 'REEMPLAZAR_POR_TU_USUARIO'
docker login
docker tag lomax-backend:local "${usuarioHub}/lomax-backend:temi-v1"
docker tag lomax-frontend:local "${usuarioHub}/lomax-frontend:temi-v1"
docker push "${usuarioHub}/lomax-backend:temi-v1"
docker push "${usuarioHub}/lomax-frontend:temi-v1"
```

Guarda enlaces a los dos repositorios y etiquetas. Para repositorios privados Kubernetes necesita imagePullSecret. Para cambiar código después, usa una etiqueta nueva y actualiza los manifiestos; IfNotPresent puede conservar la copia anterior.

## Problemas frecuentes

| Síntoma | Acción |
|---|---|
| docker o kubectl no reconocido | Repite el ajuste de PATH de esta guía en esa terminal. |
| Docker no muestra Server | Abre Docker Desktop y espera a que el motor termine de iniciar. |
| Error de plataforma o Prisma al construir/arrancar | Revisa .dockerignore en ambos directorios, reconstruye backend sin caché y consulta logs. |
| Puerto ocupado | Usa LOMAX_PORT=8080 para Compose o port-forward en otro puerto para Kubernetes. |
| 502 Bad Gateway | Revisa docker compose logs backend proxy o kubectl logs deployment/backend; confirma que terminó seed/migración y que backend está disponible. |
| PVC Pending | Consulta kubectl describe pvc postgres-pvc y kubectl get storageclass; el clúster necesita un provisionador y una clase por defecto. |
| ImagePullBackOff | Revisa nombre/etiqueta, publicación de Hub y acceso del nodo a la imagen. |
| CrashLoopBackOff | Consulta kubectl logs POD --previous y kubectl describe pod POD para ver la causa. |
| Menos de 20 pedidos | Comprueba logs y contenido existente: el seed omite una base parcialmente poblada. No borres datos para ocultar el problema. |

## Qué falta para la evaluación

Esta guía cubre tu PC y las demostraciones locales. TEMI exige además el mismo Kubernetes dentro de AWS, infraestructura compatible con las condiciones del curso, imágenes en Hub y evidencias de trabajo colaborativo. Consulta REVISION_TEMI.md para el listado de faltantes. No presentes el localhost de Docker Desktop como prueba de AWS.
