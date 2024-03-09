import React, { createContext, useContext, useEffect, useState } from "react";
import { MetaResponse, RangoClient } from "rango-sdk-basic";

export type MetaType = {
  meta: MetaResponse | null;
  metaLoading: boolean;
};

export const MetaContext = createContext<MetaType>({
  meta: null,
  metaLoading: true,
});

export const DEFAULT_BASE_URL = "https://api.rango.exchange/";
export const DEFAULT_RANGO_API_KEY = "c6381a79-2817-4602-83bf-6a641a409e32";

export const MetaContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [meta, setMeta] = useState<MetaResponse | null>(null);
  const [metaLoading, setMetaLoading] = useState<boolean>(true);

  useEffect(() => {
    const rangoClient = new RangoClient(
      import.meta.env.REACT_APP_RANGO_WIDGET_API_KEY,
      undefined,
      import.meta.env.REACT_APP_RANGO_BASE_URL
    );

    if (rangoClient) {
      rangoClient.meta().then((meta) => {
        setMeta(meta);
        setMetaLoading(false);
      });
    }
  }, []);

  return (
    <MetaContext.Provider
      value={{
        meta,
        metaLoading,
      }}
    >
      {children}
    </MetaContext.Provider>
  );
};

export function useMeta() {
  const { meta, metaLoading } = useContext(MetaContext);

  return {
    meta,
    metaLoading,
  };
}
