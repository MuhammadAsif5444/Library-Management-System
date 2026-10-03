function EmptyState({
  message = "No data found.",
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        📭
      </div>

      <p>{message}</p>
    </div>
  );
}

export default EmptyState;