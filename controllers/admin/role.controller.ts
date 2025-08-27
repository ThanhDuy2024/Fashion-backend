import { Response } from "express";
import { admin } from "../../interface/admin.interface";
import { Role } from "../../models/role.model";
import { categoryPermission } from "../../enums/categoryPermission";
export const roleCreate = async (req: admin, res: Response) => {
  const { name, permission } = req.body;

  const check = await Role.findOne({
    name: name,
  })

  if(check) {
    res.status(400).json({
      code: "error",
      message: "Role name has been existed!"
    });
    return;
  }

  const permissionArray = Object.values(categoryPermission);

  let ok;
  permission.forEach((item:any) => {
    const permissionCheck = permissionArray.includes(item);
    if(!permissionCheck) {
      ok = false
    }
  });

  if(ok === false) {
    res.status(400).json({
      code: "error"
    });
    return;
  }

  const newRole = new Role(req.body);

  await newRole.save();

  res.json({
    code: "success",
    message: "Role has been completed!"
  })
}