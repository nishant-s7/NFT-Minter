import { useState } from "react";
import { ThreeCircles } from "react-loader-spinner";

import Minted from "./Minted";

const FileUpload = () => {
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [cid, setCid] = useState("");
  const [transaction, setTransaction] = useState("");
  const [isMinted, setIsMinted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    if (file) {
      const formdata = new FormData();
      formdata.append("address", address);
      formdata.append("name", name);
      formdata.append("description", desc);
      formdata.append("file", file);
      await fetch("http://localhost:3000/upload", {
        method: "POST",
        body: formdata,
      })
        .then((res) => res.json())
        .then((data) => {
          setCid(data.cid);
          setTransaction(data.transactionHash);
        })
        .catch((err) => console.log(err))
        .finally(() => {
          setIsLoading(false);
          setIsMinted(true);
        });
    }
  };

  const retrieveFile = (e) => {
    setFile(e.target.files[0]);
    setPreview(URL.createObjectURL(e.target.files[0]));
  };

  return (
    <div>
      {isLoading ? (
        <ThreeCircles
          height="70"
          width="70"
          color="#4bb71b"
          wrapperStyle={{}}
          wrapperClass="loader"
          visible={true}
          ariaLabel="three-circles-rotating"
          outerCircleColor=""
          innerCircleColor=""
          middleCircleColor=""
        />
      ) : isMinted ? (
        <Minted cid={cid} transaction={transaction} />
      ) : (
        <form onSubmit={handleSubmit} className="frm">
          <input
            type="text"
            name="address"
            placeholder="Enter Receiver's address"
            onChange={(e) => setAddress(e.target.value)}
          />
          <input
            type="text"
            name="name"
            placeholder="Enter NFT name"
            onChange={(e) => setName(e.target.value)}
          />
          <textarea
            name="description"
            placeholder="Enter NFT description"
            rows="3"
            cols="10"
            onChange={(e) => setDesc(e.target.value)}
          ></textarea>
          <input type="file" name="file" id="file" onChange={retrieveFile} />
          {preview && (
            <div className="imgContainer">
              <img src={preview} alt="" width={350} />
            </div>
          )}
          <button type="submit">Mint NFT</button>
        </form>
      )}
    </div>
  );
};

export default FileUpload;
