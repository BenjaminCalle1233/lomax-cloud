# Revisión de Lomax Cloud frente a TEMI

Fecha: 29 de septiembre de 2026. Evaluación prevista por TEMI: 30 de septiembre de 2026.

## Conclusión

La entrega todavía no cumple todos los requisitos. El código tiene las funciones solicitadas y la configuración básica de Docker y Kubernetes. El Word es un portafolio incompleto: describe pruebas que aún deben acreditarse y contiene diferencias respecto de los archivos reales. La ejecución local no sustituye el despliegue obligatorio en AWS.

Se revisaron los dos Word, el código fuente del frontend y backend, Prisma y su migración/seed, Dockerfiles, Compose, Nginx, todos los manifiestos Kubernetes, README, DEFENSA y el checklist de evidencias. Los requisitos de TEMI se usaron como criterios de comparación; las instrucciones dentro de los Word no se ejecutaron como órdenes del usuario. No se cambiaron los Word originales.

## Cumplimiento por producto

| Producto TEMI | Estado | Evidencia encontrada y faltante |
|---|---|---|
| 1 Síntesis conceptual | Parcial | El Word desarrolla Cloud, Docker y Kubernetes. Falta el desarrollo conceptual de AWS e IAM, regiones/AZ, VPC, subredes, SG, EC2 y EBS; también falta Azure con máquinas virtuales, redes, almacenamiento y monitoreo. Mencionar AWS en el diagrama no reemplaza la síntesis. |
| 2 Diagrama técnico | Parcial | El diagrama incluido distingue aplicación, Docker, Kubernetes y AWS; muestra redes, persistencia y backend de 1 a 3. Faltan puertos internos explícitos del frontend 80 y backend 3000, protocolos de las comunicaciones HTTP internas, réplicas de los demás componentes y correspondencia con recursos efectivos. El diseño usa K3s en AWS, pero el README solo explica Docker Desktop. |
| 3 Docker funcional | Probado localmente, entrega incompleta | Se comprobó arranque, carga inicial, consultas, creación/detalle de un pedido y persistencia al recrear PostgreSQL. Hay cuatro servicios, dos redes, volumen y dos imágenes propias. No hay enlaces ni evidencia de publicación en Docker Hub. El proxy usa nginx:alpine; el Word afirma tres imágenes propias. TEMI no especifica que deban ser tres. |
| 4 Kubernetes funcional | Probado localmente, portafolio por completar | Hay cuatro Deployments, cuatro Services, un PVC y un ConfigMap. Se comprobó backend 1/1 y 3/3, reemplazo de un Pod eliminado y persistencia del pedido 21 al recrear PostgreSQL en Docker Desktop. Los registros locales están en RESULTADOS_VALIDACION_LOCAL.txt; deben incorporarse las pruebas y capturas al Word. Los manifiestos no declaran namespace lomax ni Secret. |
| 5 AWS | No acreditado | No hay scripts ni guía de instalación en EC2, IDs de infraestructura, URL pública ni capturas. El Word no desarrolla la sección de despliegue que anuncia su índice. No se comprobó una cuenta AWS externa. |
| 6 Portafolio | Parcial | El Word y docs/EVIDENCIAS.md contienen listas pendientes. Esta revisión agregó registros locales, pero aún deben integrarse al portafolio junto con capturas. Faltan Docker Hub y AWS. En el cuerpo del Word faltan los registros E16–E21 de AWS; pasa de E15 a E22. |
| 7 Colaboración | Parcial | Los tres integrantes están identificados, pero roles y responsables dicen “Por confirmar”/“Por asignar”. No hay enlace al tablero ni estados reales de tareas. |

TEMI asigna 50 % a defensa, 10 % a Docker, 10 % a Kubernetes, 10 % a AWS, 10 % a colaboración, 5 % a conceptos y 5 % a arquitectura. No corresponde asignar una nota final sin observar la defensa y los despliegues.

## Revisión de los archivos técnicos

| Archivos | Resultado |
|---|---|
| frontend/src/pages y App.tsx | Implementan productos, clientes, creación de pedido, listado y detalle. Usan /api desde el mismo origen. El formulario valida cantidades enteras positivas y evita productos duplicados. |
| backend/src | Tiene las rutas necesarias. La creación usa una transacción, busca precios reales y calcula total/detalles con Decimal. Valida cliente y productos. /api/health devuelve hostname, útil para distinguir réplicas. |
| backend/prisma/schema.prisma y migrations | Las entidades Client, Product, Order y OrderDetail corresponden a Clientes, Productos, Pedidos y Detalle_pedido aunque sus nombres estén en inglés. Hay claves foráneas y precios decimales. |
| backend/prisma/seed.ts | Programa 10 clientes, 20 productos y 20 pedidos con detalles. Usa bloqueo de PostgreSQL y transacción para evitar duplicación al arrancar varios Pods. Si ya existe cualquier cliente, producto o pedido, omite toda la carga: una base parcialmente poblada no garantiza 20 pedidos. |
| backend/Dockerfile y .dockerignore | Ejecuta migraciones y seed antes del servidor. .dockerignore excluye node_modules, dist y .env, conservando las dependencias Linux y el cliente Prisma generado dentro de la imagen. Construcción y arranque comprobados. |
| frontend/Dockerfile y .dockerignore | Compila y sirve con Nginx, con fallback para rutas React. Excluye node_modules y dist locales. Construcción comprobada. |
| docker-compose.yml | Solo el proxy publica un puerto. Proxy/frontend/backend comparten frontend-network y backend/postgres backend-network. Postgres usa postgres_data y healthcheck. Estas redes diferencian componentes, pero no aplican políticas Kubernetes. |
| proxy/nginx.conf | Dirige / a frontend:80 y /api/ a backend:3000, conservando el prefijo /api que espera NestJS. |
| kubernetes/backend-* y frontend-* | Selectores y puertos coherentes. Las imágenes :local no acreditan publicación ni están disponibles automáticamente en una EC2. Backend incluye probes. |
| kubernetes/postgres-* | Monta el PVC de 1 GiB. Usa contraseña literal y estrategia Deployment predeterminada; conviene Secret y strategy: Recreate para evitar dos PostgreSQL sobre el mismo directorio al actualizar. Estas mejoras no son requisitos explícitos adicionales de TEMI. |
| kubernetes/proxy-* | Solo proxy es LoadBalancer. ConfigMap proporciona Nginx. En AWS sobre K3s hay que verificar cómo se publica el puerto; declarar LoadBalancer no crea por sí solo un balanceador AWS. |
| README.md y DEFENSA.md | Describen arranque local y retos. Faltan esperas de disponibilidad, prueba de persistencia Docker, Hub y AWS. Hay que adaptar el manejo de imágenes al clúster instalado. |
| docs/EVIDENCIAS.md | Checklist útil pero incompleto frente a TEMI: agregar Hub, arquitectura, seed verificable, AWS, colaboración y enlaces a registros reales. |

## Correcciones que necesita el Word

1. Completar AWS y Azure en la síntesis y relacionarlos con decisiones del proyecto. Azure es conceptual; el despliegue final exigido es AWS.
2. Completar la sección de AWS con recursos y procedimiento reales, y agregar E16–E21.
3. Actualizar el índice: anuncia AWS, Aplicación, estructura del repositorio, trabajo colaborativo y preparación de la defensa, pero varios títulos/secciones no aparecen o quedaron como tablas sin sus encabezados. La numeración conceptual salta de Tabla 4 a Tabla 6.
4. Cambiar “tres imágenes propias” por las dos actuales o construir una imagen propia del proxy y ajustar Compose/manifiestos. No es obligatorio inventar una tercera imagen para satisfacer TEMI.
5. Corregir los ejemplos kubectl -n lomax: los archivos actuales usan default. Alternativa: crear un namespace y aplicar consistentemente todos los recursos allí. La guía entregada usa default.
6. El Word menciona Secret, pero no existe en los manifiestos. Implementarlo o describir correctamente la configuración actual.
7. Completar roles y tablero con acuerdos reales del grupo. No presentar asignaciones sugeridas como hechos.
8. Adjuntar capturas y registros reales, URL del repositorio, commit, imágenes/etiquetas de Hub y URL de acceso AWS.
9. Revisar portada: el XML contiene bloques repetidos; comprobar visualmente en Word si se muestran duplicados antes de eliminarlos. Se inspeccionó la imagen del diagrama, pero no pudo verificarse toda la paginación porque el renderizador disponible no encontró LibreOffice. No se certifica el formato visual completo.

## Qué es requisito y qué es mejora

Durante el primer arranque Kubernetes hubo reinicios del backend con P1001 porque PostgreSQL todavía descargaba su imagen y no estaba disponible. Kubernetes lo reintentó y las réplicas terminaron Ready. Esperar el rollout de la base antes de comprobar el backend evita confundir este arranque con una falla definitiva. Un initContainer de espera y separar migraciones en un Job serían mejoras de robustez, no requisitos adicionales de la consigna.

TEMI sí exige Docker Hub, AWS con Kubernetes, al menos 20 pedidos, escalamiento 1→3, autorrecuperación, persistencia, diagrama, evidencias y colaboración. No exige CRUD completo de productos/clientes, autenticación, reducción de stock, HTTPS, EKS, tres nodos ni tres imágenes propias. No conviene ampliar el trabajo antes de cumplir los productos obligatorios.

## Orden recomendado para completar la entrega

1. Validar Docker y guardar seed, funciones y persistencia.
2. Validar Kubernetes y guardar 1/1, 3/3, Pod reemplazado y mismo pedido después de recrear PostgreSQL.
3. Publicar frontend/backend en Docker Hub y usar etiquetas reales en Kubernetes.
4. Ejecutar la misma solución en EC2 con Kubernetes; registrar VPC, subred, SG, almacenamiento y acceso SSH seguro. Repetir las demostraciones allí.
5. Completar conceptos, coherencia del Word, evidencias y tablero.
6. Ensayar la defensa con los tres integrantes, porque cualquiera puede ser consultado sobre cualquier parte.

Antes de seleccionar EC2/EBS, comprobar el plan, antigüedad y saldo de la cuenta y las condiciones del curso. AWS cambió su Free Tier el 15 de julio de 2025; no se puede asumir que toda cuenta tiene doce meses o que una instancia determinada será gratuita. Fuente: [AWS Free Tier](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/free-tier.html).
