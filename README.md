# devops-task

kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
- --kubelet-insecure-tls


kubectl taint node node-name dedicated=app:NoSchedule


kubectl create namespace istio-system
helm repo add istio https://istio-release.storage.googleapis.com/charts
helm repo update

helm install istio-base istio/base -n istio-system

helm install istiod istio/istiod -n istio-system \
  --set global.istioNamespace=istio-system

helm install istio-ingress istio/gateway -n istio-system [I changed it nodeport type. because my system can't assing load balancer to the cluster.]

kubectl label namespace devops-task istio-injection=enabled
