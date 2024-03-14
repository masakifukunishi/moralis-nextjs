import { useState, useEffect, useCallback } from "react";
import { useEvmWalletNFTs } from "@moralisweb3/next";
import { EvmNft, EvmAddressInput } from "@moralisweb3/common-evm-utils";

interface UseFetchNFTsResult {
  nfts: EvmNft[];
  isLoading: boolean;
  hasMore: boolean;
  fetchMore: () => void;
  isFetchingMore: boolean;
}

export default function useFetchNFTs(
  address: `0x${string}` | undefined,
  selectedChainId: number | undefined,
  limitPerPage: number
): UseFetchNFTsResult {
  const { fetch: fetchNFTs } = useEvmWalletNFTs();
  const [nfts, setNfts] = useState<EvmNft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);

  const handleLoadingState = (isFetchMore: boolean, isLoading: boolean) => {
    if (isFetchMore) {
      setIsFetchingMore(isLoading);
    } else {
      setIsLoading(isLoading);
    }
  };

  const fetchData = useCallback(
    async (cursorParam?: string, isFetchMore = false) => {
      if (!address || !selectedChainId) return;
      handleLoadingState(isFetchMore, true);
      const res = await fetchNFTs({
        address: address as EvmAddressInput,
        chain: selectedChainId,
        excludeSpam: true,
        limit: limitPerPage,
        cursor: cursorParam,
      });

      if (res) {
        setNfts((prev) => (cursorParam ? [...prev, ...res.data] : res.data));
        setCursor(res.cursor);
        setHasMore(res.cursor !== null);
      }
      handleLoadingState(isFetchMore, false);
    },
    [address, selectedChainId, limitPerPage, fetchNFTs]
  );

  useEffect(() => {
    fetchData();
  }, [address, selectedChainId, fetchData]);

  const fetchMore = () => {
    if (cursor) {
      fetchData(cursor, true);
    }
  };

  return { nfts, isLoading, hasMore, fetchMore, isFetchingMore };
}
