// app/api/r2-presign/route.js
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    },
});

export async function POST(request) {
    try {
        const { filename, contentType = 'application/pdf' } = await request.json();

        if (!filename) {
        return new Response(JSON.stringify({ error: 'Filename required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
        }

    // Nombre único del archivo en R2
    const year = new Date().getFullYear();
    const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `proyectos/${year}/${Date.now()}-${safeName}`;

    const command = new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET,
        Key: key,
        ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 }); // 15 min

    const publicUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`;

    return new Response(
        JSON.stringify({ signedUrl, publicUrl, key }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    } catch (error) {
    console.error('Error generando presigned URL:', error);
    return new Response(
        JSON.stringify({ error: 'Error interno del servidor' }),
        { status: 500 }
    );
    }
}