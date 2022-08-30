import { collections, dbConnect } from '../../../backend/utils/dbConnect'
import { NextApiRequest, NextApiResponse } from 'next'
import { ObjectId } from 'mongodb'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await dbConnect()
    
    if (req.method === 'POST') {
      const { _id, name, bio } = req.body

      await collections.users?.updateOne({ _id: new ObjectId(_id) }, { $set: { name: name, bio: bio } })

      res.status(200).send({
        status: 'ok'
      })
    }

    /* Need to add extra security measures for this endpoint
    else if (req.method === 'DELETE') {
      const deletedUser = await collections.users?.deleteOne({ userId: userId })

      if (!deletedUser) {
        return res.status(400).send(`Failed to delete user with id: ${userId}`)
      }

      return res.status(200).send('Account successfully deleted')
    }
    */

    else {
      res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ success: false })
  }
}