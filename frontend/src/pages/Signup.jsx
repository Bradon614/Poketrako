import Intro from './Intro';

// Same page as the login screen (shared marketing panel + the flip card),
// just opened with the signup face already showing — direct links to
// /signup land on the right face without needing the flip animation.
export default function Signup() {
  return <Intro initialMode="signup" />;
}
