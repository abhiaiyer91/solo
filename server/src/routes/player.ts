import { Hono } from 'hono'
import profileRoutes from './player-profile'
import statsRoutes from './player-stats'
import featuresRoutes from './player-features'

const playerRoutes = new Hono()

// Mount all sub-routers
playerRoutes.route('/', profileRoutes)
playerRoutes.route('/', statsRoutes)
playerRoutes.route('/', featuresRoutes)

export default playerRoutes
