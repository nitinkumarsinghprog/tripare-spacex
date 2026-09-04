import NetInfo from "@react-native-community/netinfo";

export async function isNetworkAvailable(): Promise<boolean> {
  const state = await NetInfo.fetch();

  return state.isConnected === true && state.isInternetReachable !== false;
}

export function subscribeToNetworkChanges(
  callback: (isConnected: boolean) => void,
): () => void {
  return NetInfo.addEventListener((state) => {
    callback(state.isConnected === true && state.isInternetReachable !== false);
  });
}
