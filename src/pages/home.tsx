import { useWallets } from "@rango-dev/wallets-react";
import { WalletState, WalletTypes } from "@rango-dev/wallets-shared";
import axios from "axios";
import { EvmTransaction } from "rango-types/lib/api/main";
import { useEffect, useState } from "react";
import { useMeta } from "../hooks/useMeta";
import { TransactionType } from "rango-sdk-basic";

const WALLET_TYPE = "metamask";

export const getEVMAddress = (metamaskWalletState: WalletState) => {
  return metamaskWalletState.accounts?.[0]?.split(":")?.[1];
};

const Home = () => {
  const [txData, setTxData] = useState<
    | null
    | (EvmTransaction & { reqId: string; tgUserId: string; blockchain: string })
  >(null);
  const [message, setMessage] = useState("");

  const { connect, state, disconnect, getSigners } = useWallets();

  const { meta } = useMeta();

  const walletState = state(WALLET_TYPE);

  useEffect(() => {
    const queryParameters = new URL(window.location.href).searchParams;
    const queryData = queryParameters.get("param") || "";

    if (meta && queryData) {
      console.log(`query data: ${queryData}`);
      const bufferObj = Buffer.from(queryData, "base64");
      const txData = JSON.parse(bufferObj.toString("utf8"));
      setTxData(txData);

      connect(WALLET_TYPE)
        .then(() => {
          const signer = getSigners(WalletTypes.META_MASK).getSigner(
            TransactionType.EVM
          );
          const chainId = meta?.blockchains?.find(
            (blockchain) => blockchain.name === txData.blockChain
          )?.chainId;
          return signer.signAndSendTx(
            {
              type: txData.type,
              blockChain: txData.blockChain,
              isApprovalTx: txData.isApprovalTx,
              from: txData.from,
              to: txData.to,
              data: txData.data,
              value: txData.value,
              nonce: txData.nonce,
              gasLimit: txData.gasLimit,
              gasPrice: `0x${parseInt(txData.gasPrice, 10).toString(16)}`,
              maxPriorityFeePerGas: txData.maxPriorityFeePerGas,
              maxFeePerGas: txData.maxFeePerGas,
            },
            getEVMAddress(walletState) as string,
            chainId as string
          );
        })
        .then((result) => {
          const { hash } = result;
          console.log(`Hash is: ${hash}`);

          axios(
            `https://rangobot.cryptoeye.app/check_status?tx_hash=${hash}&request_id=${txData.reqId}&tg_user_id=${txData.tgUserId}`,
            {
              method: "GET",
              // mode: "no-cors",
              headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
              },
              withCredentials: false,
              // credentials: "same-origin",
            }
          );
        })
        .catch(() =>
          setMessage(
            "Could not sign transaction automatically, you should do it manually."
          )
        );
    }
  }, [meta]);

  const handleConnectClick = () => {
    if (!walletState.connected) {
      connect(WALLET_TYPE).catch((error) => {
        console.log(error);

        setMessage(
          `Error connecting to metamask. Please check metamask and try again.`
        );
      });
    } else {
      disconnect(WALLET_TYPE);
    }
  };

  const handleSignTransactionClick = async () => {
    if (!txData) {
      console.log("Transaction data is not available");

      return;
    }

    const signer = getSigners(WalletTypes.META_MASK).getSigner(
      TransactionType.EVM
    );

    try {
      const chainId = meta?.blockchains?.find(
        (blockchain) => blockchain.name === txData.blockChain
      )?.chainId;
      const result = await signer.signAndSendTx(
        {
          type: txData.type,
          blockChain: txData.blockChain,
          isApprovalTx: txData.isApprovalTx,
          from: txData.from,
          to: txData.to,
          data: txData.data,
          value: txData.value,
          nonce: txData.nonce,
          gasLimit: txData.gasLimit,
          gasPrice: `0x${parseInt(txData.gasPrice as string, 10).toString(16)}`,
          maxPriorityFeePerGas: txData.maxPriorityFeePerGas,
          maxFeePerGas: txData.maxFeePerGas,
        },
        getEVMAddress(walletState) as string,
        chainId as string
      );

      const { hash } = result;
      console.log(`Hash is: ${hash}`);

      const response = await axios(
        `${
          import.meta.env.REACT_APP_TELEGRAM_BOT_BASE_URL
        }/check_status?tx_hash=${hash}&request_id=${txData.reqId}&tg_user_id=${
          txData.tgUserId
        }`,
        {
          method: "GET",
          // mode: "no-cors",
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
          withCredentials: false,
          // credentials: "same-origin",
        }
      );
      console.log(response.data); // Process response data
      setMessage("Transaction signed and sent successfully");
    } catch (error) {
      setMessage("Error in signing transaction.");
    }
  };

  return (
    <div>
      <div>
        <button onClick={handleConnectClick}>
          Meatamask{" "}
          {walletState.connecting
            ? "Connecting"
            : walletState.connected
            ? "Connected"
            : walletState.installed
            ? "Disconnected"
            : "Not Installed"}
        </button>
        {walletState.connected && (
          <div style={{ marginTop: 6 }}>
            Account: {getEVMAddress(walletState)}
          </div>
        )}
      </div>

      <div style={{ marginTop: 12 }}>
        <button
          disabled={!txData || !walletState.connected}
          onClick={handleSignTransactionClick}
        >
          sign and send transaction
        </button>
        {txData && (
          <div style={{ marginTop: 6 }}>RequestId : {txData.reqId}</div>
        )}
      </div>

      <div style={{ marginTop: 12 }}>{message}</div>
    </div>
  );
};

export default Home;
