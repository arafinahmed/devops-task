# devops-task

## For Kubernets Metric Server 
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
I have updated the manifest file with the flag for getting the insigts. - --kubelet-insecure-tls



## Tainting a node.
kubectl taint node node-name dedicated=app:NoSchedule

## Installing Istio using helm chart.
kubectl create namespace istio-system
helm repo add istio https://istio-release.storage.googleapis.com/charts
helm repo update

helm install istio-base istio/base -n istio-system

helm install istiod istio/istiod -n istio-system \
  --set global.istioNamespace=istio-system

helm install istio-ingress istio/gateway -n istio-system [I changed it nodeport type. because my system can't assing load balancer to the cluster.]

Chart Name -- Version
istio/base -- 1.26.0
istio/gatewary -- 1.26.0
istio/istiod -- 1.26.0

kubectl label namespace devops-task istio-injection=enabled



## Installing grafana, loki, tempo and promethus

helm repo add grafana https://grafana.github.io/helm-charts
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm install loki grafana/loki-stack \
  --namespace monitoring \
  --create-namespace \
  --set promtail.enabled=true \
  --set loki.config.table_manager.retention_deletes_enabled=true \
  --set loki.config.table_manager.retention_period=48h \
  --set loki.image.tag=2.9.3

I  changed the image to 2.9.3 because the default image is not connecting with the grafana as data source.


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

Chart Name -- Version
Grafana   -- 9.0.0
Loki stack -- 2.10.2
Prometheus --  27.13.0
Tempo -- 1.21.1


# After login into grafana dashboard i connected data source Loki, Prometheus and Tempo 

