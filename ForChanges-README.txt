Recompile React into dist/ (local build):
cd rag-frontend
Install dependencies:
npm install
Build the production bundle(creates the '/dist' for Vite):
npm run build
We are using multistage build for saving space.
Rebuild only the frontend image:
docker compose build frontend
Run the new image to serve the updated website:
docker compose up -d --force-recreate frontend
Verify the image version actually changed: show image id used by the container:
docker inspect -f'{{.Image}}' rag-frontend
List images and see their IDs and timestamps:
docker images | head -n 20
Pushing the changed image to docker hub:
docker login
docker push shalem007/frontend-chat-bot-phase-1:latest
Tag the version so you dont lose history:
docker tag shalem007/frontend-chat-bot-phase-1:latest shalem007/frontend-chat-bot-phase-1:v1.0.3
docker push shalem007/frontend-chat-bot-phase-1:v1.0.3

