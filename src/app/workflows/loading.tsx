export default function Loading() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--border-color)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );
}
