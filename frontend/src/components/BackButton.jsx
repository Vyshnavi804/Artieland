import { useNavigate } from "react-router-dom";

const BackButton = ({ className = "" }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      className={`inline-flex items-center gap-1 text-sm text-ink/60 hover:text-violet font-body mb-4 ${className}`}
    >
      ← Back
    </button>
  );
};

export default BackButton;
