import { useSimpleStore } from './stores/test-simple';

export function SimpleTest() {
  const count = useSimpleStore((s) => s.count);
  const increment = useSimpleStore((s) => s.increment);
  
  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={increment}>Increment</button>
    </div>
  );
}
