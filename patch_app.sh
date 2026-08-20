sed -i 's/usedBytes: 82.3 \* 1024 \* 1024 \* 1024,/usedBytes: 0,/g' src/App.tsx
sed -i 's/availableBytes: 45.7 \* 1024 \* 1024 \* 1024,/availableBytes: 0,/g' src/App.tsx
sed -i 's/usedPercentage: 64,/usedPercentage: 0,/g' src/App.tsx
sed -i 's/storageUsedBytes: 82.3 \* 1024 \* 1024 \* 1024,/storageUsedBytes: 0,/g' src/App.tsx
