import { Link } from 'react-router-dom'

function RoomCard({ room }) {
  const imageUrl =
    room?.coverImageUrl ||
    (Array.isArray(room?.galleryImageUrls) ? room.galleryImageUrls[0] : null)

  return (
    <Link to={`/salas/${room._id}`} className="text-decoration-none text-dark">

      <div className="card h-100 room-card">
        {imageUrl ? (
          <img
            src={imageUrl}
            className="card-img-top"
            alt={room.title}
            style={{ height: 180, objectFit: 'cover' }}
          />
        ) : (
          <div
            className="card-img-top bg-secondary d-flex align-items-center justify-content-center"
            style={{ height: 180 }}
          >
            <span className="text-white fs-1">🔐</span>
          </div>
        )}

        <div className="card-body">
          <div className="mb-1">
            {room.themes?.slice(0, 2).map(t => (
              <span key={t} className="badge bg-light text-dark me-1 border">{t}</span>
            ))}
          </div>

          <h5 className="card-title">{room.title}</h5>
          <p className="text-muted small mb-2">
            {room.city} · {room.durationMin} min · {room.playersMin}–{room.playersMax}
          </p>

          <div className="d-flex justify-content-between align-items-center">
            <span className="small text-muted">
              {room.ratingAvg?.toFixed(1)} ({room.ratingCount})
            </span>
            <span className="fw-bold text-primary">desde {room.priceFrom}€</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default RoomCard
