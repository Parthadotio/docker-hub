import { Router } from "express";
import Docker from "dockerode";
import { log } from "node:console";

const docker = new Docker();

const REVERSE_PROXY_HOST = process.env.REVERSE_PROXY_HOST ?? "localhost";

function pullDockerPromisified(image, tag) {
  return new Promise((res, rej) => {
    docker.pull(`${image}`, { tag }, (err, stream) => {
      if (err) return rej(err);

      docker.modem.followProgress(stream, (err, output) => {
        if (err) rej(err);
        else res(output);
      });
    });
  });
}

const router = Router();

router.post("/create", async (req, res) => {
  const { image, tag } = req.body;

  const images = await docker.listImages();
  let isExisted = false;

  for (const systemImages of images) {
    for (const systemTags of systemImages.RepoTags) {
      if (systemTags === `${image}:${tag}`) {
        isExisted = true;
        break;
      }
    }
    if (isExisted) break;
  }
  if (!isExisted) {
    await pullDockerPromisified(image, tag);
  }

  const container = await docker.createContainer({
    Image: `${image}:${tag}`,
    HostConfig: {
      AutoRemove: true,
    },
  });

  const network = docker.getNetwork('deploy-engine-network');

  await container.start();
  const inspect = await container.inspect();
  await network.connect({
    Container:inspect.Id,

  })

  return res.json({
    status: "success",
    data: {
      containerName: inspect.Name,
      domain: `${inspect.Name}.${REVERSE_PROXY_HOST}`,
    },
  });
});

export default router;
