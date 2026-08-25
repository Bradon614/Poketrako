// Client-safe messages for the Prisma error codes this API can realistically
// hit. Anything else falls back to a generic message — the raw Prisma error
// (which can include table/column names) is logged server-side but never
// sent to the client.
const PRISMA_ERROR_MESSAGES = {
  P2002: 'Cette ressource existe déjà.',
  P2003: 'Référence invalide : la ressource liée n\'existe pas.',
  P2025: 'Ressource introuvable.'
};

function isPrismaKnownError(err) {
  return Boolean(err) && typeof err.code === 'string' && err.code.startsWith('P');
}

// Logs the real error and sends a safe, consistent { message } envelope.
function sendError(res, err, { status = 500, message = 'Erreur serveur interne' } = {}) {
  console.error(err);

  if (isPrismaKnownError(err) && PRISMA_ERROR_MESSAGES[err.code]) {
    const clientStatus = err.code === 'P2025' ? 404 : 400;
    return res.status(clientStatus).json({ message: PRISMA_ERROR_MESSAGES[err.code] });
  }

  res.status(status).json({ message });
}

module.exports = { sendError };
