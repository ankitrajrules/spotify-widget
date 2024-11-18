import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());

// Root endpoint for testing
app.get("/", (req, res) => {
	res.send("Welcome to the Music Widget API!");
});

// User Routes

// Create a new user
app.post("/users", async (req, res) => {
	const { githubId, githubUsername, spotifyRefreshToken } = req.body;

	try {
		const user = await prisma.user.create({
			data: {
				githubId,
				githubUsername,
				spotifyRefreshToken,
			},
		});
		res.status(201).json(user);
	} catch (error) {
		console.error(error);
		res.status(400).json({ error: "Error creating user." });
	}
});

// Get user by GitHub ID
app.get("/users/github/:githubId", async (req, res): Promise<any> => {
	const { githubId } = req.params;

	try {
		const user = await prisma.user.findUnique({
			where: { githubId },
		});

		if (!user) {
			return res.status(404).json({ error: "User not found." });
		}

		res.json(user);
	} catch (error) {
		console.error(error);
		res.status(400).json({ error: "Error fetching user." });
	}
});

// Update Spotify tokens for a user
app.patch("/users/:id", async (req, res) => {
	const userId = parseInt(req.params.id);
	const { spotifyAccessToken, tokenExpiry } = req.body;

	try {
		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: { spotifyAccessToken, tokenExpiry },
		});

		res.json(updatedUser);
	} catch (error) {
		console.error(error);
		res.status(400).json({ error: "Error updating user." });
	}
});

// Widget Routes

// Create a new widget for a user
app.post("/widgets", async (req, res) => {
	const { userId, widgetUrl, customStyle } = req.body;

	try {
		const widget = await prisma.widget.create({
			data: {
				userId,
				widgetUrl,
				customStyle: customStyle || {},
			},
		});

		res.status(201).json(widget);
	} catch (error) {
		console.error(error);
		res.status(400).json({ error: "Error creating widget." });
	}
});

// Get widgets for a user
app.get("/users/:id/widgets", async (req, res): Promise<any> => {
	const userId = parseInt(req.params.id);

	try {
		const widgets = await prisma.widget.findMany({
			where: { userId },
		});

		if (widgets.length === 0) {
			return res.status(404).json({ error: "No widgets found for this user." });
		}

		res.json(widgets);
	} catch (error) {
		console.error(error);
		res.status(400).json({ error: "Error fetching widgets." });
	}
});

// Delete a widget
app.delete("/widgets/:id", async (req, res) => {
	const widgetId = parseInt(req.params.id);

	try {
		await prisma.widget.delete({
			where: { id: widgetId },
		});

		res.status(204).send();
	} catch (error) {
		console.error(error);
		res.status(400).json({ error: "Error deleting widget." });
	}
});

// Spotify Integration Placeholder
// Implement Spotify OAuth and Now Playing API functionality here.

// Error Handling Middleware
app.use((err: any, req: any, res: any, next: any) => {
	console.error(err.stack);
	res.status(500).json({ error: "Something went wrong!" });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
