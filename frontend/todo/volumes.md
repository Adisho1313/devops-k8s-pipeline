# Kubernetes Volumes Todo

## Notes

- Kubernetes runs and manages the containers in the cluster.
- For Kubernetes workloads, you usually define storage with volumes instead of relying on `docker compose up -d`.
- Volumes are used when a container needs data that should be shared, persisted, or mounted from outside the container filesystem.

## Todo

- [ ] Learn what a Kubernetes volume is
- [ ] Understand why volumes are needed for pods
- [ ] Study the main Kubernetes volume types
- [ ] Compare persistent and temporary storage
- [ ] Write example YAML manifests for each volume type

## Types of Volumes in Kubernetes

### 1. emptyDir
- Temporary storage created when a Pod starts.
- Data is deleted when the Pod is removed.
- Good for caching, scratch space, or temporary files.

### 2. hostPath
- Mounts a file or directory from the node’s filesystem into the Pod.
- Useful for local testing or node-level access.
- Not ideal for production because it depends on the node.

### 3. persistentVolume (PV)
- A cluster resource that provides durable storage.
- Created by an administrator or provisioned dynamically.
- Can survive Pod restarts.

### 4. persistentVolumeClaim (PVC)
- A request for storage made by a Pod.
- Connects workloads to available PersistentVolumes.
- Lets apps request size and access mode without knowing storage details.

### 5. configMap
- Stores non-sensitive configuration data.
- Can be mounted as files or injected as environment variables.

### 6. secret
- Stores sensitive data such as passwords, tokens, or keys.
- Can also be mounted as files or environment variables.

### 7. nfs
- Shares storage from a Network File System server.
- Useful when multiple Pods need the same shared data.

### 8. cephfs / iscsi / glusterfs
- Network or distributed storage options.
- Used in more advanced or cloud-native storage setups.

## Quick Summary

- Temporary storage: `emptyDir`
- Node-based storage: `hostPath`
- Durable cluster storage: `persistentVolume` + `persistentVolumeClaim`
- App config: `configMap`
- Sensitive data: `secret`