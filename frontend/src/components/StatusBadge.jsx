function StatusBadge({ status }) {
  if (!status) {
    return (
      <span className="status-badge">
        Unknown
      </span>
    );
  }

  const normalizedStatus =
    status.toLowerCase();

  return (
    <span
      className={`status-badge ${normalizedStatus}`}
    >
      {status}
    </span>
  );
}

export default StatusBadge;