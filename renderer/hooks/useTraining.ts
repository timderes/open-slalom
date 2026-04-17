import { initialState, trainingReducer } from "@/lib/training/trainingReducer";
import { useReducer } from "react";

const useTraining = () => {
  const [state, dispatch] = useReducer(trainingReducer, initialState);

  const start = () => dispatch({ type: "START" });
  const lap = () => dispatch({ type: "LAP" });
  const reset = () => dispatch({ type: "RESET" });
  const skip = () => dispatch({ type: "SKIP" });

  return {
    state,
    actions: {
      start,
      lap,
      reset,
      skip,
    },
  };
};

export default useTraining;
