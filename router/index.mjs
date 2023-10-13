import Router from 'koa-router';
import { client } from '../db/db.mjs'; // Import the database client

export const router = new Router();

// Get all nodes
router.get('/tree_nodes', async (ctx) => {
    try {
        const result = await client.query('SELECT * FROM tree_nodes');
        ctx.body = result.rows;
    } catch (error) {
        console.error('Error retrieving tree_nodes', error);
        ctx.status = 500;
        ctx.body = {
            success: false,
            message: 'Error retrieving tree_nodes',
        };
    }
});

// Get a specific node by ID (GET)
router.get('/tree_nodes/:id', async (ctx) => {
    try {
        const nodeId = ctx.params.id;
        const result = await client.query(
            'SELECT * FROM tree_nodes WHERE node_id = $1',
            [nodeId]
        );

        if (result.rows.length === 0) {
            ctx.status = 404;
            ctx.body = {
                success: false,
                message: 'Node not found',
            };
        } else {
            ctx.body = {
                success: true,
                data: result.rows[0],
            };
        }
    } catch (error) {
        console.error('Error retrieving a node', error);
        ctx.status = 500;
        ctx.body = { success: false, message: 'Error retrieving a node' };
    }
});

// Create a new node (POST)
router.post('/tree_nodes', async (ctx) => {
    try {
        const { node_name, description } = ctx.request.body;
        let { parent_id } = ctx.request.body;

        if (!parent_id) parent_id = null;
        const is_root = parent_id === null;

        const result = await client.query(
            'INSERT INTO tree_nodes (node_name, description, parent_id, is_root) VALUES ($1, $2, $3, $4) RETURNING node_id',
            [node_name, description, parent_id, is_root]
        );

        ctx.body = {
            success: true,
            message: 'Node successfully created',
            nodeId: result.rows[0].node_id,
        };
    } catch (error) {
        console.error('Error creating a node', error);
        ctx.status = 500;
        ctx.body = { success: false, message: 'Error creating a node' };
    }
});

// Update an existing node (PUT)
router.put('/tree_nodes/:id', async (ctx) => {
    try {
        const nodeId = ctx.params.id;
        const { node_name, description } = ctx.request.body;
        let { parent_id } = ctx.request.body;

        if (!parent_id) parent_id = null;
        const is_root = parent_id === null;

        const result = await client.query(
            'UPDATE tree_nodes SET node_name = $1, description = $2, parent_id = $3, is_root = $4 WHERE node_id = $5',
            [node_name, description, parent_id, is_root, nodeId]
        );

        if (result.rowCount === 0) {
            ctx.status = 404;
            ctx.body = {
                success: false,
                message: 'Node not found',
            };
        } else {
            ctx.body = {
                success: true,
                message: 'Node successfully updated',
            };
        }
    } catch (error) {
        console.error('Error updating a node', error);
        ctx.status = 500;
        ctx.body = { success: false, message: 'Error updating a node' };
    }
});

// Delete a specific node by ID (DELETE)
router.delete('/tree_nodes/:id', async (ctx) => {
    try {
        const nodeId = ctx.params.id;
        const result = await client.query(
            'SELECT * FROM tree_nodes WHERE node_id = $1',
            [nodeId]
        );

        if (result.rows.length === 0) {
            ctx.status = 404;
            ctx.body = {
                success: false,
                message: 'Node not found',
            };
            return;
        }

        const deleteNode = await client.query(
            'DELETE FROM tree_nodes WHERE node_id = $1',
            [nodeId]
        );

        ctx.body = {
            success: true,
            message: 'Node successfully deleted',
            deleteNode: nodeId,
        };
    } catch (error) {
        console.error('Error deleting a node', error);
        ctx.status = 500;
        ctx.body = { success: false, message: 'Error deleting a node' };
    }
});
