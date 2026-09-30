# Comandos para la demostración local

Los comandos usados por el equipo siguen el flujo correcto: Docker Compose, detención de Compose, despliegue Kubernetes, acceso por port-forward, escalamiento, autorrecuperación y persistencia. Estos bloques agregan esperas y verificaciones para que las demostraciones sean reproducibles.

## Preparación de cada terminal PowerShell

```powershell
Set-Location 'C:\Users\PC\Desktop\tecemer\lomax'
$env:PATH="$env:LOCALAPPDATA\Programs\DockerDesktop\resources\bin;$env:PATH"
```

## Docker Compose

```powershell
$env:LOMAX_PORT=8080
docker compose up -d --build
docker compose ps
docker compose logs --tail=40 backend
curl.exe http://localhost:8080/api/health
curl.exe http://localhost:8080/api/orders
```

Abrir http://localhost:8080 y comprobar productos, clientes, registro de pedido, listado y detalle. Si un port-forward anterior ocupa 8080, detenerlo con Ctrl+C antes de arrancar Compose.

Para pasar a Kubernetes conservando datos Docker:

```powershell
docker compose down
```

Los datos de Compose y Kubernetes pertenecen a volúmenes distintos; no se comparten automáticamente. No usar down -v.

## Desplegar Kubernetes

```powershell
kubectl config current-context
kubectl apply -f kubernetes/
kubectl rollout status deployment/postgres --timeout=180s
kubectl rollout status deployment/backend --timeout=180s
kubectl rollout status deployment/frontend --timeout=180s
kubectl rollout status deployment/proxy --timeout=180s
kubectl get pods,deployments,services,pvc
```

El contexto debe ser docker-desktop y el namespace default. El PVC debe estar Bound y los Deployments disponibles. Si apply se ejecuta después de escalar, vuelve a declarar una réplica para backend porque ese es el valor del archivo.

## Terminal 1 con acceso a la aplicación

```powershell
kubectl port-forward service/proxy 8080:80
```

Dejar el comando abierto. Desde otra terminal preparada con el bloque inicial, ejecutar las siguientes pruebas. La variable LOMAX_PORT solo afecta Compose; el puerto Kubernetes lo establece el propio port-forward.

## Terminal 2 con escalamiento

```powershell
kubectl get deployments backend
kubectl scale deployment backend --replicas=3
kubectl rollout status deployment/backend --timeout=180s
kubectl get deployments backend
kubectl get pods -l app=backend
kubectl get endpointslices -l kubernetes.io/service-name=backend
1..15 | ForEach-Object { curl.exe --max-time 10 -s -H 'Connection: close' http://localhost:8080/api/health }
```

Capturar backend 1/1 antes y 3/3 después. Una única llamada de health solo muestra una réplica; las llamadas repetidas permiten observar hostnames y los Pods/endpoints acreditan las tres réplicas.

## Autorrecuperación

Este bloque selecciona automáticamente un nombre real y elimina un solo Pod backend:

```powershell
kubectl get pods -l app=backend
$podAntes=kubectl get pods -l app=backend -o jsonpath='{.items[0].metadata.name}'
kubectl delete pod $podAntes
kubectl rollout status deployment/backend --timeout=180s
kubectl get pods -l app=backend
kubectl get deployments backend
```

El nombre eliminado debe desaparecer y debe aparecer otro con backend disponible 3/3. NOMBRE_POD_BACKEND en el comando original era un marcador que debía reemplazarse.

## Persistencia del mismo pedido

Primero registrar un pedido desde la aplicación. Luego seleccionar ese pedido del listado y guardar su ID. El ejemplo toma el primero, ya que la API lista los pedidos por ID descendente:

```powershell
$pedidos=Invoke-RestMethod http://localhost:8080/api/orders
if ($pedidos.Count -eq 0) { throw 'Primero registra un pedido' }
$pedidoId=$pedidos[0].id
$antes=Invoke-RestMethod "http://localhost:8080/api/orders/$pedidoId"
$antes | ConvertTo-Json -Depth 8
kubectl get pvc
kubectl delete pod -l app=postgres
kubectl rollout status deployment/postgres --timeout=180s
kubectl get pods -l app=postgres
kubectl get pvc
$despues=Invoke-RestMethod "http://localhost:8080/api/orders/$pedidoId"
$despues | ConvertTo-Json -Depth 8
[pscustomobject]@{
  IdAntes=$antes.id
  IdDespues=$despues.id
  TotalAntes=$antes.total
  TotalDespues=$despues.total
  LineasAntes=$antes.details.Count
  LineasDespues=$despues.details.Count
}
```

El ID, total y detalle deben mantenerse y el PVC seguir Bound. Si la primera consulta posterior falla mientras se restablecen las conexiones, espera unos segundos y repítela. No eliminar el PVC ni usar kubectl delete -f kubernetes/ durante esta prueba.

## Qué falta documentar aunque el sistema funcione

Las capturas y registros reales del 29/09/2026 están en `docs/evidencias/` y en `docs/Lomax Cloud local con evidencias.docx`: una y tres réplicas, reemplazo de Pod, persistencia, contenedores y pantallas de la aplicación. Completar los roles, el tablero y los enlaces de Docker Hub cuando el equipo los tenga. Un guion en el Word marca un campo pendiente; no acredita una actividad terminada.
