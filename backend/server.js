require("dotenv").config();
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const axios = require("axios");

const app = express();

const PORT = process.env.PORT || 5000;
const SMART_CONTRACT_NETWORK = process.env.SMART_CONTRACT_NETWORK;
const SMART_CONTRACT_ADDRESS = process.env.SMART_CONTRACT_ADDRESS;
const WALLET_IMPORTED_ON_STARTON = process.env.WALLET_IMPORTED_ON_STARTON;

const upload = multer({
  limits: {
    fileSize: 5000000,
  },
});

const startonApi = axios.create({
  baseURL: "https://api.starton.com/v3",
  headers: {
    "x-api-key": process.env.STARTON_API_KEY,
  },
});

app.use(express.json());

app.use(cors());

app.post("/upload", upload.single("file"), async (req, res, next) => {
  const receiver = req.body.address;
  const name = req.body.name;
  const description = req.body.description;

  let data = new FormData();
  const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
  data.append("file", blob, { __filename: req.file.originalname });
  data.append("isSync", "true");

  try {
    const uploadImgOnIpfs = async () => {
      const ipfsImg = await startonApi.post("/ipfs/file", data, {
        headers: {
          "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
        },
      });
      return ipfsImg.data;
    };

    const uploadMetaDataOnIpfs = async (imgCid) => {
      const metadata = {
        name,
        description,
        image: `ipfs://ipfs/${imgCid}`,
      };
      const ipfsMetadata = await startonApi.post("/ipfs/json", {
        name: name,
        content: metadata,
        isSync: "true",
      });
      return ipfsMetadata.data;
    };

    const mintNFT = async (receiverAddress, metedataCid) => {
      const nft = await startonApi.post(
        `/smart-contract/${SMART_CONTRACT_NETWORK}/${SMART_CONTRACT_ADDRESS}/call`,
        {
          functionName: "mint",
          signerWallet: WALLET_IMPORTED_ON_STARTON,
          speed: "low",
          params: [receiverAddress, metedataCid],
        }
      );
      return nft.data;
    };

    const ipfsImgData = await uploadImgOnIpfs();
    const ipfsMetadata = await uploadMetaDataOnIpfs(ipfsImgData.cid);
    const nft = await mintNFT(receiver, ipfsMetadata.cid);

    res.status(200).json({
      cid: ipfsImgData.cid,
      transactionHash: nft.transactionHash,
    });
  } catch (error) {
    console.log(error);
  }
});

app.listen(PORT, () => {
  console.log(`Server listening at ${PORT}`);
});
