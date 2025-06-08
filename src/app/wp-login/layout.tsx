import './wordpress-login.css';

// Simple layout that imports CSS file - no styled-jsx needed

export default function WordPressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="login no-js login-action-login wp-core-ui locale-en-us">
      {children}
    </div>
  );
}

