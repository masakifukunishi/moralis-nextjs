import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { useEvmWalletNFTs } from "@moralisweb3/next";
import { EvmNft } from "@moralisweb3/common-evm-utils";

const address = "0x...";
const chains = [
  { id: 1, name: "Ethereum" },
  { id: 137, name: "Polygon" },
];

export default function Home() {
  const [nfts, setNfts] = useState<EvmNft[]>([]);
  const [selectedChainId, setSelectedChainId] = useState<number | undefined>();

  const { fetch: fetchNFTs } = useEvmWalletNFTs();
  const fetchData = useCallback(async () => {
    if (!address || !selectedChainId) return;
    const res = await fetchNFTs({
      address: address,
      chain: selectedChainId,
      excludeSpam: true,
    });

    if (res) {
      setNfts(res.data);
    }
  }, [selectedChainId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChainChange = (chainId: number) => {
    setSelectedChainId(chainId);
  };

  const normalizeImageUrl = (url: string | undefined) => {
    if (!url) return null;
    if (url.startsWith("https://")) {
      return url;
    }
    if (url.startsWith("ipfs://")) {
      const path = url.replace(/^ipfs:\/\/(ipfs\/)?/, "");
      return `https://nftstorage.link/ipfs/${path}`;
    }
    return null;
  };

  return (
    <main className="flex flex-col items-center justify-center">
      <div>NFTs</div>
      <div>
        <select value={selectedChainId} onChange={(e) => handleChainChange(Number(e.target.value))} className="bg-gray-900">
          <option value="">Select chain</option>
          {chains.map((chain) => (
            <option key={chain.id} value={chain.id}>
              {chain.name}
            </option>
          ))}
        </select>
        <div className="mt-10">
          {nfts.map((nft: EvmNft) => {
            const metadata = nft.metadata as { name?: string; image?: string } | undefined;
            const effectiveCollectionName = nft.name || "Unnamed";
            const effectiveTokenName = metadata?.name || "Unnamed";
            const image = normalizeImageUrl(metadata?.image);
            return (
              <div key={nft.tokenHash} className="flex flex-col items-center border p-2 rounded-md">
                {image && <Image src={image} alt={effectiveCollectionName} width={100} height={100} />}
                <div className="mt-2 text-sm text-gray-200">{effectiveCollectionName}</div>
                <div>{effectiveTokenName}</div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
