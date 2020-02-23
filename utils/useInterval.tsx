// SOURCE: https://github.com/craig1123/react-recipes/blob/master/src/useInterval.js

// _inspired by_ https://overreacted.io/making-setinterval-declarative-with-react-hooks/
import { useEffect, useRef } from 'react'

export function useInterval(
    callback: () => void,
    delay: number,
    runOnLoad = false,
    effectDependencies: any[] = []
) {
    const savedCallback = useRef()

    useEffect(() => {
        if (runOnLoad) {
            callback()
        }
    }, [...effectDependencies])

    // Remember the latest callback.
    useEffect(() => {
        // @ts-ignore
        savedCallback.current = callback
    }, [callback])

    // Set up the interval.
    useEffect(() => {
        if (delay !== null) {
            // @ts-ignore
            const id = setInterval(() => savedCallback.current(), delay)
            return () => clearInterval(id)
        }
    }, [delay, ...effectDependencies])
}

// Usage

// const App = () => {
//   // Grabs user data every 7500ms or when user changes
//   useInterval(() => {
//     if (user) {
//       getUserInfo(user);
//     }
//   }, 7500, true, [user]);

//   ...
// };
