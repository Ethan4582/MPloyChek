import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

router.get('/system-design', (req, res) => {
  try {
    // Look for system-design.md in project root or current directory
    const candidates = [
      path.resolve(process.cwd(), 'system-design.md'),
      path.resolve(process.cwd(), '..', 'system-design.md'),
    ];

    let content: string | null = null;
    for (const p of candidates) {
      if (fs.existsSync(p)) {
        content = fs.readFileSync(p, 'utf-8');
        break;
      }
    }

    if (!content) {
      res.status(404).json({ success: false, error: 'system-design.md not found' });
      return;
    }

    res.json({
      success: true,
      data: {
        filename: 'system-design.md',
        markdown: content,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
