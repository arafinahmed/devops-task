# devops-task
## important links
`app`: https://devops.arafinahmed.com/

`grafana-dashboard`: https://grafana.arafinahmed.com/

`username`: admin

`password`: arafin
## Task 1: Provision a Kubernetes Cluster
To provision a Kubernetes cluster in AWS EKS, I have written a Terraform script located in the terraform-eks folder. You need to have the Terraform CLI installed on your system to create these AWS resources. Additionally, you must have the required IAM permissions to provision the AWS resources.
```
export AWS_ACCESS_KEY_ID=aws-access-key
export AWS_SECRET_ACCESS_KEY=aws-secret-access-key
terraform init
terraform plan
terraform apply
```
For this task, I provisioned the cluster using Brilliant Kubernetes Service with one control-plane node and two worker nodes. We used Ansible for provisioning the cluster. 

For Kubernetes metrics, I installed the Kubernetes Metrics Server using the following command:
`kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml`
I updated the manifest file by adding the `- --kubelet-insecure-tls` flag to enable metric insights.

## Task 2: Optimize and Deploy a Docker Image
I cloned the repository from https://github.com/zahido/devops-exam.git. The `todo-app` in the repository did not support MongoDB initially. However, a later task required MongoDB, so I modified the application code to integrate MongoDB support.
1. Created a multi-stage build using `node:18-slim` as `builder` to install dependencies and `node:18-alpine` for the final lightweight production image.
2. Implemented security best practices by creating a non-root user (`appuser`) and copying only necessary files with proper permissions from the builder stage.
3. image: `arafinahmed/devops-task:1.0`

## Task 3: Deploy Application in Kubernetes
For task 3. I create `k8s` folder and there I stored the manitfests file.

a. The Demo App should run on two nodes.
```
affinity:
    podAntiAffinity:
        preferredDuringSchedulingIgnoredDuringExecution:
        - weight: 100
        podAffinityTerm:
            labelSelector:
            matchExpressions:
            - key: app
                operator: In
                values:
                - todo-app
            topologyKey: kubernetes.io/hostname
```
b. Run mongodb in k8s with pv and pvc.Now connect this mongodb with Demo App
```
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mongo-pvc
  namespace: devops-task
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
```
Our cluster has csi-cinder. Which will provision the persistent volume automatically.

c. Use kubernetes secrets for this Demo App
```
env:
- name: MONGO_URI
    valueFrom:
    secretKeyRef:
        name: app-secret
        key: MONGO_URI
```
d. Use Taint and Toleration

`kubectl taint node node-name dedicated=app:NoSchedule`
```
tolerations:
  - key: "dedicated"
    operator: "Equal"
    value: "app"
    effect: "NoSchedule"
```
I applied taint to one of the worker and dedicated it only for running the demo app.

e. Use istio as ingress and service mesh
I used helm for installing istio. 
```
kubectl create namespace istio-system
helm repo add istio https://istio-release.storage.googleapis.com/charts
helm repo update

helm install istio-base istio/base -n istio-system

helm install istiod istio/istiod -n istio-system \
  --set global.istioNamespace=istio-system

helm install istio-ingress istio/gateway -n istio-system
kubectl label namespace devops-task istio-injection=enabled
```
I changed the istio-ingress service type to NodePort type because of limitation in my cluster. My cluster is unable to assign floating ip in the LoadBalancer type. 
```
Chart Name     -- Version
istio/base     -- 1.26.0
istio/gateway -- 1.26.0
istio/istiod   -- 1.26.0
```
After installing istio I have Gateway and Virtual Service for passing the traffic to the application. You can access the app using https://devops.arafinahmed.com/

f. Define resource requests and limits in an optimized way.
```
resources:
    requests:
        memory: "128Mi"
        cpu: "50m"
    limits:
        memory: "256Mi"
        cpu: "200m"
```
g. Implement fixed scaling for the application based on an optimised way.

I have used hpa for scaling the demo app.

h. Allocate 2 GB of storage for the application.
```
        volumeMounts:
        - name: todo-app-storage
          mountPath: /app/data
      volumes:
      - name: todo-app-storage
        emptyDir:
          sizeLimit: 2Gi
```
## Task 4: Log & APM Management
Installing grafana, loki, tempo and promethus using helm.

```helm repo add grafana https://grafana.github.io/helm-charts
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm install loki grafana/loki-stack \
  --namespace monitoring \
  --create-namespace \
  --set promtail.enabled=true \
  --set loki.config.table_manager.retention_deletes_enabled=true \
  --set loki.config.table_manager.retention_period=48h \
  --set loki.image.tag=2.9.3
```
I  changed the image to 2.9.3 because the default image is not connecting with the grafana as data source.

```
helm install tempo grafana/tempo \
  --namespace monitoring

helm install prometheus prometheus-community/prometheus \
  --namespace monitoring --create-namespace


helm install grafana grafana/grafana \
  --namespace monitoring \
  --set adminPassword='admin' \
  --set service.type=ClusterIP \
  --set persistence.enabled=true \
  --set persistence.size=1Gi
```
```
Chart Name  -- Version
Grafana     -- 9.0.0
Loki stack  -- 2.10.2
Prometheus  -- 27.13.0
Tempo       -- 1.21.1
```
After successfully installing these 4 tools. I went to the grafana dashboard and login using the credentials. Before that I write an ingress file for accessing the grafana dashboard. https://grafana.arafinahmed.com/

## Task 4: Monitor Kubernetes Cluster
I connected data sources such as Prometheus, Loki, and Tempo. After that, I created dashboards and added several panels to visualize pod metrics, node metrics, log data, and more. Additionally, I set up two alerts to monitor the usage of the demo application.