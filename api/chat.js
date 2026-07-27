export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method Not Allowed"
        });
    }

    return res.status(200).json({
        success: true,
        message: "Builder AI API is ready for Gemini."
    });

}