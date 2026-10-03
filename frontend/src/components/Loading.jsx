function Loading({
  message = "Loading...",
}) {
  return (
    <div className="loading-container">
      <div className="loading-spinner" />

      <p>{message}</p>
    </div>
  );
}

export default Loading;