import {Router} from "express";
import { searchBuses } from "../controllers/searchController";
const router = Router();

router.get("/trips/search", searchBuses);

export default router;