interface LoaderProps {
  message?: string;
}

export default function Loader({ message = "Loading..." }: LoaderProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="loader-container h-64">
        <div className="modern-loader" />
        <p className="loader-text">{message}</p>
      </div>
    </div>
  );
}
